import { Character } from "@/game/characters/Character";
import GunBehaviour from "@/game/guns/behaviour/GunBehaviour";
import GunModel from "@/game/guns/models/GunModel";
import GameScene from "@/game/GameScene";
import distanceAway from "@/math/distanceAway";

/**
 * TODO: this is garbage
 */

export default class Player {
  readonly container: Phaser.GameObjects.Container;
  gun?: GunBehaviour;
  gunSprite?: Phaser.GameObjects.GameObject;
  
  constructor(
    readonly id: number,
    readonly game: GameScene,
    readonly character: Character,
  ) {
    character.player = this;
    this.container = game.add.container();
    character.addToContainer(this.container);
  }
    
  instantiateGun(model: GunModel, tile: Phaser.Tilemaps.Tile) {
    if (this === this.game.mainPlayer) {
      this.game.networkClient.gotGun({ x: tile.x, y: tile.y });
    }

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
    this.game.networkClient.equipGun(this.getGun().equipped);
  }

  fireBullet(angle: number) {
          // put a bullet where the player is
          const { x, y, width, height } = this.character.body;
          const bullet = this.game.physics.add.sprite(x + width / 2, y + height / 2, "bullet-bullet")
            .setCircle(2) // give the bullet a circle hitbox instead of a rectangular one
            .setOrigin(1, 0.5) // TODO: figure out how to best map the origin to the image
            // TODO: this doesn't work:
            // .setFriction(0, 0).setGravity(0, 0) // bullets should have "no gravity" so that they go in a straight line
            .setCollideWorldBounds(true)

            // make the bullet collide with the level
          this.game.events.on("update", () => {
            this.game.physics.collide(bullet, this.game.world.foreground.display.tilemapLayer);
            this.game.physics.collide(bullet, this.game.world.action.display.tilemapLayer);
            for (const [_, player] of this.game.players.players) {
              this.game.physics.collide(player.character.body, bullet);
            }
          }, this);
    
          // spawn the bullet pretty fast at the desired angle
          let velocity = distanceAway({ x: 0, y: 0 }, angle, 2000);
          bullet.setVelocity(velocity.x, velocity.y);
    
          // kill bullet after 2 seconds
          this.game.time.delayedCall(2000, bullet.destroy, [], bullet);
  }
}
