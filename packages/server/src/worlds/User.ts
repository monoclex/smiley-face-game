import { UserId } from "@smiley-face-game/api/src/models/UserId";
import { WorldPacket } from "@smiley-face-game/api/src/networking/game/WorldPacket";
import * as WebSocket from 'ws';
import { User } from '../models/User';

export class WorldUser {
  constructor(
    private readonly _webSocket: WebSocket,
    readonly userId: UserId,
    readonly databaseUser?: User,
  ) {
    // TODO: decouple from client impl
    this.lastPosition = { x: 32 + 16, y: 32 + 16 };
  }

  lastPosition: { x: number, y: number };
  hasGun = false; // by default, they don't have a gun
  gunEquipped = true; // as soon as they have a gun it's immediately equipped

  get username(): string {
    if (this.databaseUser !== undefined) {
      return this.databaseUser.username;
    }
    else {
      return `Guest${this.userId}`;
    }
  }

  get isGuest(): boolean {
    return this.databaseUser === undefined;
  }

  send(packet: WorldPacket): Promise<void> | void {
    if (this._webSocket.readyState === WebSocket.OPEN) {
      return this._webSocket.send(JSON.stringify(packet));
    }
  }

  kill(): Promise<void> | void {
    return this._webSocket.close();
  }
}