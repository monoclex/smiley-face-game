import CharacterController from "@/game/components/character/CharacterController";
import Character from "@/game/components/character/Character";
import GunController from "@/game/components/gun/GunController";
import Gun from "@/game/components/gun/Gun";

export default class Player {
  readonly character: Character;
  readonly gun?: Gun;

  constructor(
    scene: Phaser.Scene,
    characterController: CharacterController,
    gunController: GunController
  ) {
    this.character = new Character(scene, characterController);
  }
}
