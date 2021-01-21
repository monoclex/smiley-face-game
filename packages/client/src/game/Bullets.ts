import Bullet from "./components/Bullet";
import Player from "./components/Player";
import Timer from "./Timer";

export default class Bullets {
  protected bullets: Bullet[] = [];

  constructor(protected readonly timer: Timer) {}

  spawn(at: Player, angle: number) {
    // TODO: put bullet in front of gun
    const bullet = new Bullet(at.position.x, at.position.y, angle);
    this._spawnBullet(bullet);
  }

  protected _spawnBullet(bullet: Bullet) {
    this.bullets.push(bullet);

    const TWO_SECONDS = 2000;
    this.timer.schedule(new Date(new Date().getTime() + TWO_SECONDS), () => {
      // TODO: kinda ugly how we find the bullet and then pass it to cleanup which has to find the index again
      const index = this.bullets.indexOf(bullet);
      const deletedBullet = this.bullets[index];
      this._cleanupBullet(deletedBullet);
    });
  }

  protected _cleanupBullet(bullet: Bullet) {
    bullet.cleanup();
    const idx = this.bullets.indexOf(bullet);
    this.bullets = this.bullets.splice(idx, 1);
  }

  [Symbol.iterator]() {
    return this.bullets[Symbol.iterator]();
  }
}
