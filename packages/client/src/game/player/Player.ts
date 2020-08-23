import CharacterController from "@/game/components/character/CharacterController";
import Character from "@/game/components/character/Character";
import GunController from "@/game/gun/GunController";
import Gun from "@/game/gun/Gun";
import PlayerController from "./PlayerController";
import PlayerLayers from "./PlayerLayers";
import World from "../world/World";

export default class Player {
  readonly character: Character;
  
  gun?: Gun;
  
  readonly #scene: Phaser.Scene;
  readonly #gunController: GunController;

  constructor(
    scene: Phaser.Scene,
    layers: PlayerLayers,
    world: World,
    controller: PlayerController,
    gunController: GunController
  ) {
    this.#scene = scene;
    this.character = new Character(scene, world, controller);
    this.#gunController = gunController;

    this.#scene.events.on("update", () => {
      if (!this.gun) {
        controller.isHeld = false;
      }
      else {
        gunController.isHeld = controller.isHeld;
      }
    }, this);
  }

  gunEquipped(equipped: boolean) {
    this.#gunController.isHeld = equipped;
  }

  giveGun() {
    this.gun = new Gun(this.#scene, { firingRate: 83.333, bulletLife: 1000 }, this.#gunController);
  }

  takeGun() {
    if (this.gun) {
      this.gun.destroy();
    }
  }
}
