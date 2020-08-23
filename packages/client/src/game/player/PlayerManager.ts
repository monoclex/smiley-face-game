import GunController from "@/game/components/gun/GunController";
import PlayerController from "./PlayerController";
import Player from "./Player";
import PlayerLayers from "./PlayerLayers";

export default class PlayerManager {
  readonly players: Map<number, Player>;

  constructor(readonly scene: Phaser.Scene) {
    this.players = new Map();
  }

  addPlayer(id: number, layers: PlayerLayers, controller: PlayerController, gunController: GunController): Player {
    const player = new Player(this.scene, layers, controller, gunController);
    this.players.set(id, player);
    return player;
  }
}