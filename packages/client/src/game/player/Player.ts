import { Character } from "@/game/characters/Character";
import GunBehaviour from "@/game/guns/behaviour/GunBehaviour";
import GunModel from "@/game/guns/models/GunModel";
import GameScene from "@/game/GameScene";

/**
 * TODO: this is garbage
 */

export default class Player {
  readonly container: Phaser.GameObjects.Container;
  gun?: GunBehaviour;
  gunSprite?: Phaser.GameObjects.GameObject;
  
  constructor(
    readonly game: GameScene,
    readonly character: Character,
  ) {
    character.player = this;
    this.container = game.add.container();
    character.addToContainer(this.container);
  }
    
  instantiateGun(model: GunModel) {
    this.gun = model.behaviourFactory(this.game, this);
    this.gunSprite = this.container.last;
    this.game.events.on("update", this.gun.update, this.gun);
  }

  get canEdit(): boolean {
    return true;
  }

  get hasGun(): boolean {
    return !!this.gun;
  }

  get gunEquipped(): boolean {
    return this.hasGun && this.gun!.equipped;
  }

  getGun(): GunBehaviour {
    if (!this.gun) {
      throw new Error("attempted to equip gun on a player that does not have a gun");
    }

    return this.gun;
  }

  toggleGunEquipped() {
    if (this.getGun().equipped) {
      // if it's currently equipped, we need to put the gun behind the player (or the player in front of the gun)
      this.container.bringToTop(this.character.body);
      for (const cosmetic of this.character.cosmeticSprites) {
        this.container.bringToTop(cosmetic);
      }
    }
    else {
      // if the gun is currently unequipped, we need to put the gun in front of the player
      this.container.bringToTop(this.gunSprite!);
    }

    //@ts-ignore
    this.getGun().equipped = !this.getGun().equipped;
  }
}
