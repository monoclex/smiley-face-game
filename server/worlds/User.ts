import { WebSocket } from "../deps.ts";
import { UserId } from "../libcore/core/models/UserId.ts";
import { WorldPacket } from "../libcore/core/networking/game/WorldPacket.ts";

export class User {
  constructor(
    private readonly _webSocket: WebSocket,
    readonly userId: UserId,
  ) {
    // TODO: decouple from client impl
    this.lastPosition = { x: 32 + 16, y: 32 + 16 };
  }

  lastPosition: { x: number, y: number };
  hasGun: boolean = false; // by default, they don't have a gun
  gunEquipped: boolean = true; // as soon as they have a gun it's immediately equipped

  send(packet: WorldPacket): Promise<void> | void {
    return this._webSocket.send(JSON.stringify(packet));
  }

  kill(): Promise<void> | void {
    return this._webSocket.close();
  }
}