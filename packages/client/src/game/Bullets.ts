import Bullet from "./Bullet";
import Player from "./Player";
import BulletCtor from "./BulletCtor";

export default class Bullets {
  private readonly bullets: Bullet[] = [];
  private readonly B: BulletCtor;

  constructor(constructor?: BulletCtor) {
    this.B = constructor || Bullet;
  }

  spawn(at: Player, angle: number) {
    // TODO: put bullet in front of gun
    const bullet = new this.B(at.position.x, at.position.y, angle);
    this.bullets.push(bullet);
  }

  [Symbol.iterator]() {
    return this.bullets[Symbol.iterator]();
  }
}
