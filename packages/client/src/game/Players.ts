import { ZSPlayerJoin } from "@smiley-face-game/api/packets";
import Player from "./components/Player";
import PlayerCtor from "./interfaces/PlayerCtor";

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
    player.cleanup();
    this._map.delete(id);
    return player;
  }

  [Symbol.iterator]() {
    return this._map.values();
  }

  cleanup() {
    // this is here because a derived class, ClientPlayers, needs to call `cleanup` so we
    // need to typecheck that `cleanup` exists in `Game` because `Game` handles cleaning up
    // players
    // i thought about just having ClientGame call ClientPlayers.cleanup() but in the event that
    // players itself needs to clean things up then i need to screw with inheritence so
    // this is being left as a placeholder incase i need to clean stuff up here in the future
  }
}
