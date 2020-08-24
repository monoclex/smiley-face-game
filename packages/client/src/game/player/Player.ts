
import PlayerController from "./PlayerController";
import PlayerLayers from "./PlayerLayers";
import World from "../world/World";
import { Character } from "@/game/characters/Character";
import { Gun } from "@/scenes/world/components/Gun";
import GameScene from "../GameScene";

export default class Player {
  readonly character: Character;
  
  gun?: Gun;
  
  readonly #scene: Phaser.Scene;
  // readonly #gunController: GunController;

  constructor(
    scene: GameScene,
    layers: PlayerLayers,
    world: World,
    controller: PlayerController,
    // gunController: GunController
  ) {
    this.#scene = scene;
    this.character = new Character(scene);
    // this.#gunController = gunController;

    this.#scene.events.on("update", () => {
      if (!this.gun) {
        controller.isHeld = false;
      }
      else {
        // gunController.isHeld = controller.isHeld;
      }
    }, this);
  }

  gunEquipped(equipped: boolean) {
    // this.#gunController.isHeld = equipped;
  }

  giveGun() {
    // this.gun = new Gun(this.#scene, { firingRate: 83.333, bulletLife: 1000 }, this.#gunController);
  }

  takeGun() {
    if (this.gun) {
      this.gun.destroy();
    }
  }
}
