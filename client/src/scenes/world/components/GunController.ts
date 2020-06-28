import { Character } from './Character';
export class GunController {
  readonly heldGun: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, private readonly _character: Character) {
    this.heldGun = scene.add.sprite(0, 0, 'held_gun');
    this.heldGun.visible = false;
  }

  update(pointer: Phaser.Input.Pointer, camera: Phaser.Cameras.Scene2D.Camera) {
    const worldPosition = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
    
    // get the angle from the player to the pointer
    let angle = Phaser.Math.Angle.BetweenPoints(this._character.sprite, worldPosition);
    
    // set the position to be 20 pixels away from the center of the charcter, based on the angle
    this.heldGun.setX(this._character.sprite.x + Math.cos(angle) * 20);
    this.heldGun.setY(this._character.sprite.y + Math.sin(angle) * 20);

    // MATH TIME:
    // we want the gun to rotate so that when it's to the right, it'll look right, when it's to the left, it'll look left
    // here are the values "angle" could be

    // -Math.PI / 2
    //   _
    //  / \
    // |Pi | 0
    //  \_/
    // Math.PI / 2

    // so when the angle is above Math.PI, we will subtract it by Math.PI and flip the X so that it looks the same but reversed

    this.heldGun.setFlipX(false);
    if (Math.abs(angle) > Math.PI / 2) {
      if (angle < 0) angle += Math.PI;
      else angle -= Math.PI;
      this.heldGun.setFlipX(true);
    }

    // put the gun in that angle infront of the player
    this.heldGun.setRotation(angle);
  }
}