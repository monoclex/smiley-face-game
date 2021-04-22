import Bullet from "./Bullet";
import Player from "./Player";
import Timer from "./Timer";

export default class Bullets {
  protected bullets: Bullet[] = [];

  constructor(protected readonly timer: Timer) { }

  spawn(at: Player, angle: number) {
    // TODO: spawn bullet directly in front of gun for more realistic aiming
    const bullet = new Bullet(at.position.x, at.position.y, angle);
    this._spawnBullet(bullet);
  }

  protected _spawnBullet(bullet: Bullet) {
    this.bullets.push(bullet);

    const SECOND = 1_000;
    this.timer.schedule(2 * SECOND, () => {
      const index = this.bullets.indexOf(bullet);
      this._cleanupBullet(index);
    });
  }

  protected _cleanupBullet(bulletIndex: number) {
    const bullet = this.bullets[bulletIndex];
    bullet.cleanup();

    this.bullets = this.bullets.splice(bulletIndex, 1);
  }

  [Symbol.iterator]() {
    return this.bullets[Symbol.iterator]();
  }
}
