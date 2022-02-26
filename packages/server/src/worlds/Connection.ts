import * as WebSocket from "ws";
import type { ZSPacket } from "@smiley-face-game/api";
import type { ZJoinRequest } from "@smiley-face-game/api/ws-api";
import AccountRepo from "../database/repos/AccountRepo";
import AuthPayload from "../jwt/payloads/AuthPayload";
import Room from "../worlds/Room";
import PromiseCompletionSource from "../concurrency/PromiseCompletionSource";
import type { ZRole } from "@smiley-face-game/api/types";

export default class Connection {
  playerId!: number;
  connected = false;
  username!: string;
  isGuest!: boolean;
  isOwner = false;
  private _room?: Room;

  // room things
  // TODO: decouple 'lastPosition' default state
  lastPosition: { x: number; y: number } = { x: 32, y: 32 };
  hasGun = false;
  gunEquipped = false;
  lastMessage: Date = new Date();
  messagesCounter = 0; // counts how many messages have been sent in a row with a close enough `Date` to eachother
  role: ZRole = "non";
  hasEdit = false;
  get canPlaceBlocks(): boolean {
    return this.hasEdit && (this.hasGun ? !this.gunEquipped : true);
  }
  canGod = false;
  inGod = false;

  constructor(
    readonly webSocket: WebSocket,
    readonly authTokenPayload: AuthPayload,
    readonly worldTokenPayload: ZJoinRequest
  ) {
    // ping the client every 30 seconds
    const pingTimer = setInterval(() => {
      if (webSocket.readyState === webSocket.OPEN) {
        webSocket.ping();
      } else {
        clearInterval(pingTimer);
      }
    }, 30 * 1000);
  }

  async load(accountRepo: AccountRepo) {
    if (this.authTokenPayload.aud === "") {
      this.isGuest = true;
      this.username = this.authTokenPayload.name ?? "unknownguest";
    } else {
      const account = await accountRepo.findById(this.authTokenPayload.aud);
      this.isGuest = false;
      this.username = account.username;
    }
  }

  async play(room: Room): Promise<void> {
    this._room = room;

    if (!room.join(this)) {
      // TODO: send websocket a "couldn't join room" packet here?
      this.kill("Couldn't join room.");
      return;
    }

    this.connected = true;
    const validator = room.validateWorldPacket;

    this.webSocket.on("message", async (wsData) => {
      if (!this.connected) {
        console.warn("received message despite websocket being disconnected");
        return;
      }

      // it simply is a string /shrug
      const data = wsData as unknown as string;
      if (typeof data !== "string") {
        console.error("got non-string", wsData);
        this.kill("Sent a non-string.");
        return;
      }

      if (data.length >= 8096) {
        this.kill("Sent a magnum payload."); // all hail danny devito
        return;
      }

      const message = JSON.parse(data);

      // handle parsing 'data' here
      const packet = validator.parse(message);
      // const [errors, packet] = validator(message);
      // if (errors !== null || packet === undefined) {
      //   console.warn("unvalidatable packet", errors, message);
      //   this.kill("Sent an unvalidatable payload");
      //   return;
      // }

      const result = await room.onMessage(this, packet);
      if (result === false) {
        console.warn("invalid packet", packet);
        this.kill("sent an invalid packet");
        return;
      }
    });

    const untilClose = new PromiseCompletionSource();

    this.webSocket.on("error", (error) => {
      console.warn("sudden websocket close", error);
      if (!this.connected) return;
      this.connected = false;
      room.leave(this);
      untilClose.resolve();
    });

    this.webSocket.on("close", () => {
      if (!this.connected) return;
      this.connected = false;
      room.leave(this);
      untilClose.resolve();
    });

    await untilClose.promise;
  }

  // TODO: introduce serialization stuff
  send(packet: ZSPacket) {
    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(packet));
    }
  }

  kill(reason: string) {
    this.webSocket.close(undefined, reason);

    if (this._room) {
      if (!this.connected) return;
      this.connected = false;
      this._room.leave(this);
    }
  }
}
