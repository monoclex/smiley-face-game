import distanceAway from "../../../math/distanceAway";

export default abstract class GunBehaviour {
  constructor(readonly player: Phaser.GameObjects.Sprite, readonly gun: Phaser.GameObjects.Sprite) { }

  equipped: boolean = true;
  angle: number = 0.0;

  setLookingAt(x: number, y: number) {
    this.angle = Phaser.Math.Angle.Between(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      x,
      y
    );
  }

  update(_time: number, _delta: number): void {
    if (!this.equipped) {
      // place it behind the player and rotate it so it looks like it's carried on the player's back diagonally-ish
      this.gun.setPosition(this.player.x + 16 - 6, this.player.y + 16 - 6);
      this.gun.setRotation(Math.PI / 3.5);
      this.gun.setFlipX(false);
      return;
    }

    // gun is equipped, have it go around the player

    // given the angle the user is holding it at, place the gun 20 units away from the player
    const heldGunPosition = distanceAway({ x: this.player.x + 16, y: this.player.y + 16 }, this.angle, 20);
    this.gun.setPosition(heldGunPosition.x, heldGunPosition.y);

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
      } else {
        displayAngle -= Math.PI;
      }

      this.gun.flipX = true;
    } else {
      this.gun.flipX = false;
    }

    this.gun.setRotation(displayAngle);
  }

  abstract destroy(): void;
}
