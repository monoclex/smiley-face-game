import Bullet from "./components/Bullet";
import Player from "./components/Player";

export default class Bullets {
  protected bullets: Bullet[] = [];

  spawn(at: Player, angle: number) {
    // TODO: put bullet in front of gun
    const bullet = new Bullet(at.position.x, at.position.y, angle);
    this._spawnBullet(bullet);
  }

  protected _spawnBullet(bullet: Bullet) {
    this.bullets.push(bullet);

    // TODO: this is definitely a hack, duplicated from ClientBullets.ts
    setTimeout(() => {
      const index = this.bullets.indexOf(bullet);
      this.bullets = this.bullets.splice(index, 1);
    }, 2000);
  }

  [Symbol.iterator]() {
    return this.bullets[Symbol.iterator]();
  }
}
