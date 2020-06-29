import { WorldScene } from "../WorldScene";
import { Player } from './Player';
import { Position } from "./Position";

export class Gun {

  firing: boolean = false;
  angle: number = 0;

  onBulletFired?: () => void;

  readonly heldGun: Phaser.GameObjects.Sprite;

  /** When the gun is fired, this is set to false and a timeout is set to turn this back to true at a later point. */
  private _canShoot: boolean = true;

  constructor(readonly worldScene: WorldScene, readonly player: Player) {
    this.heldGun = worldScene.add.sprite(0, 0, 'held_gun');

    worldScene.groupGuns.add(this.heldGun);
  }

  update() {
    this.displayGun();

    // handle shooting the gun
    if (this.firing && this._canShoot) {

      this.toggleShootCooldown(100);
      this.fireBullet();
    }
  }

  fireBullet() {
    // place the bullet at the barrel of the gun
    const WIDTH_OF_GUN = 32;
    const bulletPosition = this.distanceFrom(this.heldGun, WIDTH_OF_GUN / 2, this.angle);

    const bullet = this.worldScene.matter.add
      .image(bulletPosition.x, bulletPosition.y, 'bullet', null, {
        restitution: 0,
        friction: 0,
        // really dense so it makes a big impact on players
        density: 1,
        angle: this.angle,
      })
      .setScale(2, 2);
    
    // apply "8" units of force in the direction, makes it go fast
    bullet.applyForce(this.distanceFrom({ x: 0, y: 0 }, 8, this.angle) as Phaser.Math.Vector2);
    this.worldScene.groupBullets.add(bullet);

    // kill the bullet later
    setTimeout(() => {
      bullet.destroy();
    }, 1000);

    if (this.onBulletFired) this.onBulletFired();
  }

  private displayGun() {
    // given the angle the user is holding it at, place the gun 20 units away from the player
    const heldGunPosition = this.distanceFrom(this.player.sprite, 20, this.angle);
    this.heldGun.setPosition(heldGunPosition.x, heldGunPosition.y);

    // MATH TIME:
    // 'angle' will be approximately the following:

    //  -PI / 2
    //    ____
    //   /    \
    // P|      | 0
    // I|      |
    //   \____/
    //   PI / 2

    // if |angle| > (pi / 2), we'll flip the x axis and subtract pi to get the right rotation for the flipped gun

    let displayAngle = this.angle;

    if (Math.abs(this.angle) > Math.PI / 2) {
      if (this.angle < 0) {
        displayAngle += Math.PI;
      }
      else {
        displayAngle -= Math.PI;
      }

      this.heldGun.flipX = true;
    } else {
      this.heldGun.flipX = false;
    }

    this.heldGun.setRotation(displayAngle);
  }

  destroy() {
    this.heldGun.destroy();
  }

  private toggleShootCooldown(ms: number) {
    this._canShoot = false;
    setTimeout(() => this._canShoot = true, ms);
  }

  private distanceFrom(point: Position, unitsAway: number, angle: number): Position {
    // TODO: phaser probably has some math function for this built in, should use it
    return {
      x: point.x + Math.cos(angle) * unitsAway,
      y: point.y + Math.sin(angle) * unitsAway,
    }
  }
}