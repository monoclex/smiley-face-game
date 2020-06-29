import { Character } from './Character';
import MultiKey from './MultiKey';
export class GunController {
  readonly heldGun: Phaser.GameObjects.Sprite;
  private _keyE: MultiKey;
  bulletGroup: Phaser.GameObjects.Group;

  _canShoot: boolean = true;

  constructor(
    private readonly _scene: Phaser.Scene,
    private readonly _character: Character,
    private readonly _bulletGroup: Phaser.GameObjects.Group,
    private readonly _reactToE?: boolean,
  ) {
    this.heldGun = this._scene.add.sprite(0, 0, 'held_gun');
    this.heldGun.visible = false;
    this._keyE = new MultiKey(_scene, [Phaser.Input.Keyboard.KeyCodes.E]);
  }

  update(gunAngle: number) {
    if (!this._character.hasGun) return;

    // set the position to be 20 pixels away from the center of the charcter, based on the angle
    const heldGunPosition = this.distanceFrom(this._character.sprite, 20, gunAngle);
    this.heldGun.setPosition(heldGunPosition.x, heldGunPosition.y);

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

    let angle = gunAngle;
    if (Math.abs(angle) > Math.PI / 2) {
      if (angle < 0) angle += Math.PI;
      else angle -= Math.PI;
      this.heldGun.setFlipX(true);
    }

    // put the gun in that angle infront of the player
    this.heldGun.setRotation(angle);

    if (this._reactToE && this._keyE.isDown()) {
      if (this._character.networkClient) {
        console.log('fireBullet called');
        this._character.networkClient.fireBullet(gunAngle);
      }

      this.fireBullet(gunAngle);
    }
  }

  private distanceFrom(point: { x: number, y: number }, units: number, angle: number): { x: number, y: number } {
    return {
      x: point.x + Math.cos(angle) * units,
      y: point.y + Math.sin(angle) * units,
    };
  }

  fireBullet(angle: number) {

    if (!this._canShoot) return;
    this._canShoot = false;
    setTimeout(() => this._canShoot = true, 100);

    // we want the bullet to be at the barrel of the gun
    const WIDTH_OF_GUN = 32;
    const bulletPosition = this.distanceFrom(this.heldGun, (WIDTH_OF_GUN / 2), angle);

    const thing = this._scene.matter.add
      .image(bulletPosition.x, bulletPosition.y, 'bullet', null, {
        restitution: 0,
        friction: 0,
        density: 1,
        angle: angle
      })
      .setScale(2, 2);
    
    thing.applyForce(this.distanceFrom({ x: 0, y: 0 }, 8, angle) as Phaser.Math.Vector2);

    this._bulletGroup.add(thing);

    setTimeout(() => {
      thing.destroy();
    }, 1000);
  }
}