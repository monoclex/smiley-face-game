import { Character } from "@/game/characters/Character";
import GunBehaviour from "@/game/guns/behaviour/GunBehaviour";
import GunModel from "@/game/guns/models/GunModel";
import GameScene from "@/game/GameScene";
import distanceAway from "@/math/distanceAway";
import BaseType from "@/game/characters/bases/BaseType";
import baseKey from "@/game/characters/bases/key";
import CosmeticType from "@/game/characters/cosmetics/CosmeticType";
import cosmeticKey from "@/game/characters/cosmetics/key";
import MovementInput from "@/game/input/MovementInput";
import MovementValues from "@/game/input/MovementValues";

// the higher the depth number, the closer to the user it appears
let _depth = 0;
const GUN_UNEQUIPPED_DEPTH = _depth++;
const BODY_DEPTH = _depth++;
const COSMETIC_DEPTH = _depth++;
const GUN_EQUIPPED_DEPTH = _depth++;
const USERNAME_DEPTH = _depth++;

/**
 * A Player is designed to be a dumb class in the sense that it does not source any data from the outside world, but that the outside world
 * will process events and manipulate the player to do things.
 * 
 * In the nature of that design, everything about the Player is primarily related to changing data on a function call.
 */
export default class Player {
  readonly container: Phaser.GameObjects.Container;
  readonly body: Phaser.Physics.Arcade.Sprite;
  readonly usernameText: Phaser.GameObjects.Text;
  readonly cosmeticSprites: Phaser.GameObjects.Image[];
  readonly input: MovementValues = { left: false, right: false, jump: false };

  gun?: GunBehaviour;
  gunSprite?: Phaser.GameObjects.Sprite;

  get canEdit(): boolean {
    return true;
  }

  get hasGun(): boolean {
    return !!this.gun;
  }

  get gunEquipped(): boolean {
    return this.hasGun && this.gun!.equipped;
  }

  get guaranteeGun(): GunBehaviour {
    if (!this.hasGun) {
      throw new Error("attempt to guarantee gun when gun doesn't exist");
    }

    return this.gun!;
  }
  
  constructor(
    readonly id: number,
    readonly game: GameScene,
    readonly username: string,
    readonly base: BaseType = "original",
    readonly cosmetics: CosmeticType[] = ["smile"],
  ) {
    this.container = game.add.container();
    
    this.body = this.game.physics.add.sprite(0, 0, baseKey(base))
      .setMaxVelocity(300, 500)
      .setDrag(3000, 0)
      .setOrigin(0, 0)
      .setCollideWorldBounds(true)
      .setDepth(BODY_DEPTH);
    this.container.add(this.body);

    this.cosmeticSprites = cosmetics.map(cosmetic => {
      let cosmeticSprite = this.game.add.image(0, 0, cosmeticKey(cosmetic))
        .setOrigin(0, 0)
        .setDepth(COSMETIC_DEPTH);
      return cosmeticSprite;
    });
    this.cosmeticSprites.forEach(this.container.add.bind(this.container));

    this.usernameText = this.game.add.text(0, 0, username)
      .setOrigin(0.5, 0)
      .setDepth(USERNAME_DEPTH);
    this.container.add(this.usernameText);
    
    this.game.events.on("update", this.update, this);
    this.game.events.on("postupdate", this.postUpdate, this);

    // this is a hacky workaround for GunTile to be able to access this `Player` from the `body` sprite
    this.body.player = this;
  }

  setPosition(x: number, y: number) {
    this.body.setPosition(x, y);
  }

  setVelocity(x: number, y: number) {
    this.body.setVelocity(x, y);
  }

  updateInputs(input: MovementInput) {
    if (input.left !== undefined) this.input.left = input.left;
    if (input.right !== undefined) this.input.right = input.right;
    if (input.jump !== undefined) this.input.jump = input.jump;
  }
    
  instantiateGun(model: GunModel, doSendTile?: Phaser.Tilemaps.Tile) {
    if (doSendTile) {
      this.game.networkClient.gotGun({ x: doSendTile.x, y: doSendTile.y });
    }

    const [behaviour, gunSprite] = model.behaviourFactory(this.game, this);
    this.gun = behaviour;
    this.gunSprite = gunSprite;
    this.container.add(this.gunSprite);
  }

  fireBullet(angle: number) {
    // put a bullet where the player is
    const { x, y, width, height } = this.body;
    
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
        this.game.physics.collide(player.body, bullet);
      }
    }, this);

    // spawn the bullet pretty fast at the desired angle
    let velocity = distanceAway({ x: 0, y: 0 }, angle, 2000);
    bullet.setVelocity(velocity.x, velocity.y);
    
    // kill bullet after 2 seconds
    this.game.time.delayedCall(2000, bullet.destroy, [], bullet);
  }

  update() {
    if (this.gunEquipped) {
      this.guaranteeGun.gun.setDepth(GUN_EQUIPPED_DEPTH);
    }
    else if (this.hasGun) {
      this.guaranteeGun.gun.setDepth(GUN_UNEQUIPPED_DEPTH);
    }

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
