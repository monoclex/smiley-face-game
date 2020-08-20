import * as WebSocket from "ws";
import { WorldPacket } from "@smiley-face-game/api/packets/WorldPacket";
import { WorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import AccountRepo from "@/database/repos/AccountRepo";
import AuthPayload from "@/jwt/payloads/AuthPayload";
import Room from "@/worlds/Room";

export default class Connection {
  playerId!: number;
  connected: boolean = false;
  username!: string;
  isGuest!: boolean;

  // room things
  // TODO: decouple 'lastPosition' default state
  lastPosition: { x: number, y: number } = { x: 32 + 16, y: 32 + 16 };
  hasGun: boolean = false;
  gunEquipped: boolean = false;

  get canPlaceBlocks(): boolean { return this.hasGun ? !this.gunEquipped : true; }

  constructor(
    readonly webSocket: WebSocket,
    readonly authTokenPayload: AuthPayload,
    readonly worldTokenPayload: WorldJoinRequest,
  ) {
    // ping the client every 30 seconds
    let pingTimer = setInterval(() => {
      if (webSocket.readyState === webSocket.OPEN) {
        webSocket.ping();
      }
      else {
        clearInterval(pingTimer);
      }
    }, 30 * 1000);
  }

  async load(accountRepo: AccountRepo) {
    if (this.authTokenPayload.aud === "") {
      this.isGuest = true;
      this.username = this.authTokenPayload.name!;
    }
    else {
      const account = await accountRepo.findById(this.authTokenPayload.aud);
      this.isGuest = false;
      this.username = account.username;
    }
  }

  play(room: Room) {
    if (!room.join(this)) {
      // TODO: send websocket a "couldn't join room" packet here?
      this.kill("Couldn't join room.");
      return;
    }

    this.connected = true;
    const validator = room.validateWorldPacket;

    this.webSocket.on("message", async (data) => {
      if (!this.connected) {
        console.warn("received message despite websocket being disconnected");
        return;
      }

      if (typeof data !== "string") {
        this.kill("Sent a non-string.");
        return;
      }

      if (data.length >= 8096) {
        this.kill("Sent a magnum payload."); // all hail danny devito
        return;
      }

      const message = JSON.parse(data);

      // handle parsing 'data' here
      const [errors, packet] = validator(message);
      if (errors !== null || packet === undefined) {
        console.warn("invalid packet", errors);
        this.kill("Sent an invalid payload");
        return;
      }

      const result = await room.onMessage(this, packet);
      if (result === false) {
        this.kill("sent an invalid packet");
      }
    });

    this.webSocket.on("error", (error) => {
      console.warn("sudden websocket close", error);
      this.connected = false;
      room.leave(this);
    });

    this.webSocket.on("close", (code, reason) => {
      this.connected = false;
      room.leave(this);
    });
  }

  // TODO: introduce serialization stuff
  send(packet: WorldPacket) {
    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(packet));
    }
  }

  kill(reason: string) {
    this.webSocket.close(undefined, reason);
  }
}