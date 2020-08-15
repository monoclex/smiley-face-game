import * as WebSocket from "ws";
import { validateWorldPacket, WorldPacket } from "@smiley-face-game/api/packets/WorldPacket";
import AccountRepo from "@/database/repos/AccountRepo";
import AuthPayload from "@/jwt/payloads/AuthPayload";
import WorldPayload from "@/jwt/payloads/WorldPayload";
import Room from "@/worlds/Room";

export default class Connection {
  playerId?: number;
  connected: boolean = false;
  username!: string;
  isGuest!: boolean;

  // room things
  // TODO: decouple 'lastPosition' default state
  lastPosition: { x: number, y: number } = { x: 32 + 16, y: 32 + 16 };
  hasGun: boolean = false;
  gunEquipped: boolean = false;

  constructor(
    readonly webSocket: WebSocket,
    readonly authTokenPayload: AuthPayload,
    readonly worldTokenPayload: WorldPayload,
  ) {}

  async load(accountRepo: AccountRepo) {
    // TODO: load self from database or something
    await Promise.resolve();
  }

  play(room: Room) {
    if (!room.join(this)) {
      // TODO: send websocket a "couldn't join room" packet here?
      this.kill("Couldn't join room.");
      return;
    }

    this.connected = true;

    this.webSocket.on("message", (data) => {
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
      const [errors, packet] = validateWorldPacket(message);
      if (errors !== null || packet === undefined) {
        this.kill("Sent an invalid payload");
        return;
      }

      room.onMessage(this, packet);
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
    this.webSocket.send(JSON.stringify(packet));
  }

  kill(reason: string) {
    this.webSocket.close(undefined, reason);
  }
}