import { ZSPlayerJoin } from "../packets";
import { Player } from "../physics/Player";
import { ZRole } from "../types";

export class Players {
  readonly map: Map<number, Player> = new Map();

  _list: Player[] = [];
  get list(): Player[] {
    return this._list;
  }

  /**
   * Event handler that gets fired when a player is added.
   */
  onPlayerAdd?: (player: Player) => void;

  /**
   * Event handler that gets fired when a player is removed.
   */
  onPlayerRemove?: (player: Player) => void;

  get(id: number): Player {
    const player = this.map.get(id);

    if (!player) throw new Error("Unable to get player " + id);
    return player;
  }

  add(event: ZSPlayerJoin): Player {
    const player = new Player(event.playerId, event.username, event.role, event.isGuest, event.joinLocation);
    this.map.set(event.playerId, player);
    this._list = Array.from(this.map.values());
    if (this.onPlayerAdd) this.onPlayerAdd(player);
    return player;
  }

  remove(id: number) {
    const player = this.get(id);
    if (this.onPlayerRemove) this.onPlayerRemove(player);
    this.map.delete(id);
    this._list = Array.from(this.map.values());
  }

  updateRole(playerId: number, newRole: ZRole) {
    this.get(playerId).role = newRole;
  }
}
