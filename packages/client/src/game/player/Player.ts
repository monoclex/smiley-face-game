import { Character } from "@/game/characters/Character";
import GunBehaviour from "@/game/guns/behaviour/GunBehaviour";
import GunModel from "@/game/guns/models/GunModel";
import GameScene from "@/game/GameScene";

export default class Player {
  gun?: GunBehaviour;

  constructor(
    readonly game: GameScene,
    readonly character: Character,
  ) {}

  instantiateGun(model: GunModel) {
    this.gun = model.behaviourFactory(this.game, this.character.body);
    this.game.events.on("update", this.gun.update, this.gun);
  }

  getGun(): GunBehaviour {
    if (!this.gun) {
      throw new Error("attempted to equip gun on a player that does not have a gun");
    }

    return this.gun;
  }
}
