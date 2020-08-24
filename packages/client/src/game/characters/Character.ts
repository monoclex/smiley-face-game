import GameScene from "@/game/GameScene";
import BaseType from "@/game/characters/bases/BaseType";
import baseKey from "@/game/characters/bases/key";
import CosmeticType from "@/game/characters/cosmetics/CosmeticType";
import cosmeticKey from "@/game/characters/cosmetics/key";

export class Character {
  readonly body: Phaser.Physics.Arcade.Sprite;
  readonly cosmeticSprites: Phaser.GameObjects.Image[];

  constructor(
    readonly game: GameScene,
    readonly base: BaseType = "original",
    readonly cosmetics: CosmeticType[] = ["smile"],
  ) {
    this.body = this.game.physics.add.sprite(0, 0, baseKey(base)).setOrigin(0, 0);

    this.cosmeticSprites = [];
    for (const cosmetic of cosmetics) {
      this.cosmeticSprites.push(this.game.add.image(0, 0, cosmeticKey(cosmetic)).setOrigin(0, 0));
    }

    this.game.events.on("update", this.update, this);
    this.game.events.on("postupdate", this.postUpdate, this);
  }

  addToContainer(container: Phaser.GameObjects.Container) {
    container.add(this.body);
    
    for (const cosmetic of this.cosmeticSprites) {
      container.add(cosmetic);
    }
  }

  update() {
    this.game.physics.collide(this.body, this.game.world.foreground.display.tilemapLayer);
    
    const sprite = this.body;
    const acceleration = 200;
    // we extract out the props because they could be getters/setters
    let right = true;
    let jump = true;
    let left = false;
    let x = undefined;
    let y = undefined; // const { x, y, left, right, jump } = this.controller;

    // if the controller is a network controller, this is how we'll update the position
    sprite.setPosition(x === undefined ? sprite.x : x, y === undefined ? sprite.y : y);

    if (left && right) sprite.setAccelerationX(0);
    else if (left) { sprite.setAccelerationX(-acceleration); sprite.setFlipX(true); }
    else if (right) { sprite.setAccelerationX(acceleration); sprite.setFlipX(false); }
    else sprite.setAccelerationX(0);
    
    const onGround = sprite.body.blocked.down;
    if (jump && onGround) sprite.setVelocityY(-500);
  }

  postUpdate() {
    // once all physics calculations are done, make sure the cosmetics are on the player
    for (const cosmeticSprite of this.cosmeticSprites) {
      cosmeticSprite.setPosition(this.body.x, this.body.y);
    }
  }
}
