import CharacterController from "@/game/components/character/CharacterController";
import Character from "@/game/components/character/Character";
import GunController from "@/game/components/gun/GunController";
import Gun from "@/game/components/gun/Gun";
import PlayerController from "./PlayerController";
import PlayerLayers from "./PlayerLayers";

export default class Player {
  readonly character: Character;
  
  gun?: Gun;
  
  readonly #scene: Phaser.Scene;
  readonly #gunController: GunController;

  constructor(
    scene: Phaser.Scene,
    layers: PlayerLayers,
    controller: PlayerController,
    gunController: GunController
  ) {
    this.#scene = scene;
    this.character = new Character(scene, controller);
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

  giveGun() {
    this.gun = new Gun(this.#scene, { firingRate: 83.333, bulletLife: 1000 }, this.#gunController);
  }

  takeGun() {
    if (this.gun) {
      this.gun.destroy();
    }
  }
}
