import GunController from "@/game/components/gun/GunController";
import PlayerController from "./PlayerController";
import Player from "./Player";
import PlayerLayers from "./PlayerLayers";
import World from "../tiles/World";

export default class PlayerManager {
  readonly players: Map<number, Player>;

  constructor(readonly scene: Phaser.Scene) {
    this.players = new Map();
  }

  addPlayer(id: number, layers: PlayerLayers, world: World, controller: PlayerController, gunController: GunController): Player {
    const player = new Player(this.scene, layers, world, controller, gunController);
    this.players.set(id, player);
    return player;
  }
}