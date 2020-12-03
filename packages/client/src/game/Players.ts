import { ZSPlayerJoin } from "@smiley-face-game/api/packets";
import Player from "./Player";
import PlayerCtor from "./PlayerCtor";

export default class Players {
  private readonly _map: Map<number, Player> = new Map();
  private readonly P: PlayerCtor;

  constructor(constructor?: PlayerCtor) {
    this.P = constructor || Player;
  }

  getPlayer(id: number): Player {
    const player = this._map.get(id);
    if (!player) throw new Error(`getPlayer failed with id ${id}`);
    return player;
  }

  addPlayer(joinInfo: ZSPlayerJoin): Player {
    const player = new this.P(joinInfo.playerId, joinInfo.username, joinInfo.isGuest);

    player.role = joinInfo.role;
    player.position = joinInfo.joinLocation;

    if (joinInfo.hasGun) {
      player.pickupGun();

      if (joinInfo.gunEquipped) {
        player.holdGun(true);
      }
    }

    this._map.set(joinInfo.playerId, player);
    return player;
  }

  removePlayer(id: number): Player {
    const player = this.getPlayer(id);
    player.destroy();
    this._map.delete(id);
    return player;
  }

  [Symbol.iterator]() {
    return this._map.values();
  }
}
