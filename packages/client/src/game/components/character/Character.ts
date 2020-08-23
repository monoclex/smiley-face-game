import Component from "@/game/components/Component";
import CharacterController from "./CharacterController";
import World from "@/game/world/World";
import urlSmiley from "@/assets/mmmyep.png";

type CharacterType = "smiley";

function key(characterType: CharacterType): string {
  return "character-" + characterType;
}

export default class Character implements Component {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  static load(loader: Phaser.Loader.LoaderPlugin) {
    loader.image(key("smiley"), urlSmiley);
  }

  constructor(readonly scene: Phaser.Scene, readonly world: World, controller: CharacterController) {
    this.sprite = scene.physics.add.sprite(0, 0, key("smiley"));
    this.sprite.setDrag(1000, 0).setMaxVelocity(500, 520);
    this.sprite.setOrigin(0, 0);
    this.sprite.setCollideWorldBounds(true);
    this.controller = controller;

    scene.events.on("update", this.update, this);
  }

  update() {
    this.scene.physics.collide(this.display.sprite, this.world.foreground.display.tilemapLayer);
    
    const sprite = this.display.sprite;
    const acceleration = 200;
    // we extract out the props because they could be getters/setters
    const { x, y, left, right, jump } = this.controller;

    // if the controller is a network controller, this is how we'll update the position
    sprite.setPosition(x === undefined ? sprite.x : x, y === undefined ? sprite.y : y);

    if (left && right) sprite.setAccelerationX(0);
    else if (left) { sprite.setAccelerationX(-acceleration); sprite.setFlipX(true); }
    else if (right) { sprite.setAccelerationX(acceleration); sprite.setFlipX(false); }
    else sprite.setAccelerationX(0);
    
    const onGround = sprite.body.blocked.down;
    if (jump && onGround) sprite.setVelocityY(-500);
  }
}
