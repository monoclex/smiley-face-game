import Bullet from "./components/Bullet";
import Player from "./components/Player";

export default class Bullets {
  protected readonly bullets: Bullet[] = [];

  spawn(at: Player, angle: number) {
    // TODO: put bullet in front of gun
    const bullet = new Bullet(at.position.x, at.position.y, angle);
    this.bullets.push(bullet);
  }

  [Symbol.iterator]() {
    return this.bullets[Symbol.iterator]();
  }
}
