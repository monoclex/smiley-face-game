import Component from "@/game/components/Component";
import CharacterController from "./CharacterController";
import CharacterDisplay from "./CharacterDisplay";
import World from "@/game/tiles/World";

export default class Character implements Component {
  readonly display: CharacterDisplay;
  readonly controller: CharacterController;

  constructor(readonly scene: Phaser.Scene, readonly world: World, controller: CharacterController) {
    this.display = new CharacterDisplay(scene, "smiley");
    this.controller = controller;

    scene.events.on("update", this.update, this);
  }

  update() {
    this.scene.physics.collide(this.display.sprite, this.world.foreground.display.tilemapLayer);
    
    const sprite = this.display.sprite;
    const acceleration = 2000;
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
