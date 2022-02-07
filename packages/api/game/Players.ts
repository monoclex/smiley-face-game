import { createNanoEvents } from "nanoevents";
import { ZSInit, ZSPlayerJoin } from "../packets";
import { Player } from "../physics/Player";
import { ZRole } from "../types";

interface PlayerEvents {
  add(player: Player): void;
  remove(player: Player): void;
}

export class Players {
  readonly map: Map<number, Player> = new Map();
  readonly events = createNanoEvents<PlayerEvents>();

  _list: Player[] = [];
  get list(): Player[] {
    return this._list;
  }

  constructor(init: ZSInit) {
    for (const player of init.players) {
      this.add(player);
    }
  }

  get(id: number): Player {
    const player = this.map.get(id);

    if (!player) throw new Error("Unable to get player " + id);
    return player;
  }

  add(event: ZSPlayerJoin): Player {
    const player = new Player(event.playerId, event.username, event.role, event.isGuest, event.joinLocation);
    this.map.set(event.playerId, player);
    this._list = Array.from(this.map.values());
    this.events.emit("add", player);
    return player;
  }

  remove(id: number) {
    const player = this.get(id);
    this.events.emit("remove", player);
    this.map.delete(id);
    this._list = Array.from(this.map.values());
  }

  updateRole(playerId: number, newRole: ZRole) {
    this.get(playerId).role = newRole;
  }
}
