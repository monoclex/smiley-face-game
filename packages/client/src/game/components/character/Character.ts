import Component from "@/game/components/Component";
import CharacterController from "./CharacterController";
import CharacterDisplay from "./CharacterDisplay";

export default class Character implements Component {
  readonly display: CharacterDisplay;
  readonly controller: CharacterController;

  constructor(scene: Phaser.Scene, controller: CharacterController) {
    this.display = new CharacterDisplay(scene, "smiley");
    this.controller = controller;

    scene.events.on("update", this.update, this);
  }

  update() {
    const sprite = this.display.sprite;
    const acceleration = 600;
    // we extract out the props because they could be getters/setters
    const { x, y, left, right, jump } = this.controller;

    // since this function takes possibly undefined values, we can safely pass x/y here without a hitch
    // if the controller is a network controller, this is how we'll update the position
    sprite.setPosition(x, y);

    if (left && right) sprite.setAccelerationX(0);
    else if (left) { sprite.setAccelerationX(-acceleration); sprite.setFlipX(true); }
    else if (right) { sprite.setAccelerationX(acceleration); sprite.setFlipX(false); }
    else sprite.setAccelerationX(0);
    
    const onGround = sprite.body.blocked.down;
    if (jump && onGround) sprite.setVelocityY(-520);
  }
}
