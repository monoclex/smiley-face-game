import GameScene from "@/game/GameScene";
import BaseType from "@/game/characters/bases/BaseType";
import baseKey from "@/game/characters/bases/key";
import CosmeticType from "@/game/characters/cosmetics/CosmeticType";
import cosmeticKey from "@/game/characters/cosmetics/key";
import MovementInput from "@/game/input/MovementInput";
import MovementValues from "@/game/input/MovementValues";
import Player from "@/game/player/Player";

export class Character {
  readonly body: Phaser.Physics.Arcade.Sprite;
  readonly usernameText: Phaser.GameObjects.Text;
  readonly cosmeticSprites: Phaser.GameObjects.Image[];
  readonly input: MovementValues = { left: false, right: false, jump: false };
  player?: Player;

  constructor(
    readonly game: GameScene,
    readonly username: string,
    readonly base: BaseType = "original",
    readonly cosmetics: CosmeticType[] = ["smile"],
  ) {
    this.body = this.game.physics.add.sprite(0, 0, baseKey(base)).setMaxVelocity(300, 500).setDrag(3000, 0).setOrigin(0, 0).setCollideWorldBounds(true);

    // add a reference from that game object to the character for ease of use
    //@ts-ignore
    this.body.character = this;

    this.usernameText = this.game.add.text(0, 0, username).setOrigin(0.5, 0);

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

    container.add(this.usernameText);
  }

  setPosition(x: number, y: number) {
    this.body.setPosition(x, y);
  }

  setVelocity(x: number, y: number) {
    this.body.setVelocity(x, y);
  }

  getPlayer(): Player {
    if (!this.player) {
      throw new Error("unable to get player - " + JSON.stringify(this));
    }

    return this.player;
  }

  updateInputs(input: MovementInput) {
    if (input.left !== undefined) this.input.left = input.left;
    if (input.right !== undefined) this.input.right = input.right;
    if (input.jump !== undefined) this.input.jump = input.jump;
  }

  update() {
    this.game.physics.collide(this.body, this.game.world.foreground.display.tilemapLayer);
    this.game.physics.collide(this.body, this.game.world.action.display.tilemapLayer);
    
    const sprite = this.body;
    const acceleration = 10000;

    const { left, right, jump } = this.input;

    if (left && right) sprite.setAccelerationX(0);
    else if (left) { sprite.setAccelerationX(-acceleration); sprite.setFlipX(true); }
    else if (right) { sprite.setAccelerationX(acceleration); sprite.setFlipX(false); }
    else sprite.setAccelerationX(0);
    
    const onGround = sprite.body.blocked.down;
    if (jump && onGround) sprite.setVelocityY(-500);
  }

  postUpdate() {
    // once all physics calculations are done, make sure that the player's extra things
    // (like cosmetics and username) are connected to the player

    // align the username above the player, with 4 pixels of padding
    this.usernameText.setPosition(this.body.x + (this.body.width / 2), this.body.y - this.usernameText.height + 4);

    for (const cosmeticSprite of this.cosmeticSprites) {
      cosmeticSprite.setPosition(this.body.x, this.body.y);
    }
  }

  destroy() {
    this.game.events.off("update", this.update, this);
    this.game.events.off("postupdate", this.postUpdate, this);

    this.body.destroy();
    this.usernameText.destroy();

    for (const cosmeticSprite of this.cosmeticSprites) {
      cosmeticSprite.destroy();
    }
  }
}
