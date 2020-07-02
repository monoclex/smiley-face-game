import { WorldScene } from "../WorldScene";
import { Player } from './Player';
import { Position } from "./Position";

const WIDTH_OF_GUN = 40;

export class Gun {

  equipped: boolean;
  firing: boolean = false;
  angle: number = 0;

  onBulletFired?: () => void;

  readonly sprite: Phaser.GameObjects.Sprite;

  /** When the gun is fired, this is set to false and a timeout is set to turn this back to true at a later point. */
  private _canShoot: boolean = true;

  constructor(readonly worldScene: WorldScene, readonly player: Player) {
    this.sprite = worldScene.add.sprite(0, 0, 'held_gun');
    this.equip();
  }

  doEquip(state: boolean) {
    if (state) this.equip();
    else this.unequip();
  }

  equip() {
    this.equipped = true;
    this.worldScene.containerUnheldGuns.remove(this.sprite);
    this.worldScene.containerHeldGuns.add(this.sprite);
  }

  unequip() {
    this.equipped = false;
    this.worldScene.containerHeldGuns.remove(this.sprite);
    this.worldScene.containerUnheldGuns.add(this.sprite);
  }

  update() {
    this.displayGun();

    // handle shooting the gun
    if (this.firing && this.equipped && this._canShoot) {

      this.toggleShootCooldown(100);
      this.fireBullet();
    }
  }

  fireBullet() {
    // place the bullet at the barrel of the gun
    const bulletPosition = this.distanceFrom(this.sprite, WIDTH_OF_GUN / 2, this.angle);

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
    this.worldScene.containerBullets.add(bullet);

    // kill the bullet later
    setTimeout(() => {
      bullet.destroy();
    }, 1000);

    if (this.onBulletFired) this.onBulletFired();
  }

  private displayGun() {
    if (!this.equipped) {
      // place it behind the player and rotate it so it looks like it's carried on the player's back diagonally-ish
      this.sprite.setPosition(this.player.sprite.x - 6, this.player.sprite.y - 6);
      this.sprite.setRotation(Math.PI / 3.5);
      this.sprite.setFlipX(false);
      return;
    }

    // given the angle the user is holding it at, place the gun 20 units away from the player
    const heldGunPosition = this.distanceFrom(this.player.sprite, 20, this.angle);
    this.sprite.setPosition(heldGunPosition.x, heldGunPosition.y);

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

      this.sprite.flipX = true;
    } else {
      this.sprite.flipX = false;
    }

    this.sprite.setRotation(displayAngle);
  }

  destroy() {
    this.sprite.destroy();
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