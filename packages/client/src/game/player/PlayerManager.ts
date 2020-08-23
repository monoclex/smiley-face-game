import GunController from "@/game/gun/GunController";
import PlayerController from "./PlayerController";
import Player from "./Player";
import PlayerLayers from "./PlayerLayers";
import World from "../world/World";

export default class PlayerManager {
  readonly players: Map<number, Player>;

  constructor(readonly scene: Phaser.Scene) {
    this.players = new Map();
  }

  private getPlayer(id: number): Player {
    const player = this.players.get(id);

    if (player === undefined) {
      console.warn("Attempt to retreive player", id, "is undefined.");
      throw new Error("Undefined player id " + id);
    }

    return player;
  }

  addPlayer(id: number, layers: PlayerLayers, world: World, controller: PlayerController, gunController: GunController): Player {
    const player = new Player(this.scene, layers, world, controller, gunController);
    this.players.set(id, player);
    return player;
  }

  removePlayer(playerId: number) {
    this.players.delete(playerId);
  }

  onEquipGun(playerId: number, equipped: boolean) {
    const player = this.getPlayer(playerId);
    player.gunEquipped(equipped);
  }

  onFireBullet(playerId: number) {
    this.getPlayer(playerId).gun?.fireBullet();
  }

  onPickupGun(playerId: number) {
    this.getPlayer(playerId).giveGun();
  }
}