import Player from "./Player";
import GameScene from "../GameScene";
import M249LMG from "../guns/models/M249LMG";

export default class PlayerManager {
  readonly players: Map<number, Player> = new Map();

  constructor(readonly game: GameScene) { }

  tickPlayers() {
    for (const player of this.players.values()) {
      player.update();
    }

    for (const player of this.players.values()) {
      player.postUpdate();
    }
  }

  getPlayer(id: number): Player {
    const player = this.players.get(id);

    if (player === undefined) {
      console.warn("Attempt to retrieve player", id, "is undefined.");
      throw new Error("Undefined player id " + id);
    }

    return player;
  }

  addPlayer(id: number, username: string, playerContainer: Phaser.GameObjects.Container): Player {
    const player = new Player(id, this.game, username);
    this.players.set(id, player);
    playerContainer.add(player.container);
    return player;
  }

  removePlayer(playerId: number) {
    const player = this.getPlayer(playerId);
    player.destroy();
    if (player.gun) player.gun.destroy();

    this.players.delete(playerId);
  }

  onEquipGun(playerId: number, equipped: boolean) {
    const player = this.getPlayer(playerId);

    if (!player.gun) {
      console.warn("attempted to equip gun on a player that does not have a gun");
      return;
    }

    player.gun.equipped = equipped;
  }

  onFireBullet(playerId: number, angle: number) {
    this.getPlayer(playerId).fireBullet(angle);
    this.getPlayer(playerId).guaranteeGun.angle = angle;
  }

  onPickupGun(playerId: number) {
    // TODO: allow the pickup gun packet to specify what type of gun
    this.getPlayer(playerId).instantiateGun(M249LMG);
  }
}
