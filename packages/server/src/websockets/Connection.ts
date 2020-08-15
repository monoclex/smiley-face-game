import * as WebSocket from "ws";
import AuthPayload from "@/jwt/payloads/AuthPayload";
import WorldPayload from "@/jwt/payloads/WorldPayload";
import Room from "@/worlds/Room";
import { validateWorldPacket } from "../../../api/src/networking/packets/WorldPacket";

export default class Connection {
  playerId?: number;

  constructor(
    readonly webSocket: WebSocket,
    readonly authTokenPayload: AuthPayload,
    readonly worldTokenPayload: WorldPayload,
  ) {}

  play(room: Room) {
    if (!room.join(this)) {
      // TODO: send websocket a "couldn't join room" packet here?
      this.webSocket.close(undefined, "Couldn't join room.");
      return;
    }

    let connected = true;

    this.webSocket.on("message", (data) => {
      if (!connected) {
        console.warn("received message despite websocket being disconnected");
        return;
      }

      if (typeof data !== "string") {
        this.webSocket.close(undefined, "Sent a non-string.");
        return;
      }

      if (data.length >= 8096) {
        this.webSocket.close(undefined, "Sent a magnum payload."); // all hail danny devito
        return;
      }

      const message = JSON.parse(data);

      // handle parsing 'data' here
      const [errors, packet] = validateWorldPacket(message);
      if (errors !== null || packet === undefined) {
        this.webSocket.close(undefined, "Sent an invalid payload");
        return;
      }

      room.onMessage(this, packet);
    });

    this.webSocket.on("error", (error) => {
      console.warn("sudden websocket close", error);
      connected = false;
      room.leave(this);
    });

    this.webSocket.on("close", (code, reason) => {
      connected = false;
      room.leave(this);
    });
  }
}