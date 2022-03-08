import * as WebSocket from "ws";
import type { ZSPacket } from "@smiley-face-game/api";
import type { ZJoinRequest } from "@smiley-face-game/api/ws-api";
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
  lastPosition: { x: number; y: number } = { x: 16, y: 16 };
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

  constructor(readonly connection: HostConnection) {}

  load() {
    this.isGuest = this.connection.userId === null;
    this.username = this.connection.username;
  }

  // TODO: introduce serialization stuff
  send(packet: ZSPacket) {
    this.connection.send(JSON.stringify(packet));
  }

  kill(reason: string) {
    this.connection.close(reason);

    if (this._room) {
      if (!this.connected) return;
      this.connected = false;
      this._room.leave(this);
    }
  }
}
