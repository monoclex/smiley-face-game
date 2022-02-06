import { ZSPlayerJoin } from "../packets";
import { Player } from "../physics/Player";
import { ZRole } from "../types";

export class Players {
  readonly map: Map<number, Player> = new Map();

  get(id: number): Player {
    const player = this.map.get(id);

    if (!player) throw new Error("Unable to get player " + id);
    return player;
  }

  add(event: ZSPlayerJoin) {
    const player = new Player(event.playerId, event.username, event.role, event.isGuest, event.joinLocation);
    this.map.set(event.playerId, player);
  }

  remove(id: number) {
    this.map.delete(id);
  }

  updateRole(playerId: number, newRole: ZRole) {
    this.get(playerId).role = newRole;
  }
}
