import * as WebSocket from 'ws';
import { UserId } from "../../common/models/UserId";
import { WorldPacket } from "../../common/networking/game/WorldPacket";

export class User {
  constructor(
    private readonly _webSocket: WebSocket,
    readonly userId: UserId,
  ) {
    // TODO: decouple from client impl
    this.lastPosition = { x: 32 + 16, y: 32 + 16 };
  }

  lastPosition: { x: number, y: number };
  hasGun = false; // by default, they don't have a gun
  gunEquipped = true; // as soon as they have a gun it's immediately equipped

  send(packet: WorldPacket): Promise<void> | void {
    if (this._webSocket.readyState === WebSocket.OPEN) {
      return this._webSocket.send(JSON.stringify(packet));
    }
  }

  kill(): Promise<void> | void {
    return this._webSocket.close();
  }
}