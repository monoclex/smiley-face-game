import { Container } from "pixi.js";
import Bullets from "../Bullets";
import Timer from "../Timer";
import ClientBullet from "./ClientBullet";
import ClientPlayer from "./ClientPlayer";

export default class ClientBullets extends Bullets {
  constructor(timer: Timer, private readonly bulletContainer: Container) {
    super(timer);
  }

  spawn(at: ClientPlayer, angle: number) {
    // TODO: put bullet in front of ***gun***, not at player
    // (and be really smart about it - not just plopping it in the center)
    const bullet = new ClientBullet(at.center.x, at.center.y, angle);

    this.bulletContainer.addChild(bullet.sprite);

    super._spawnBullet(bullet);
  }

  _cleanupBullet(bulletIndex: number) {
    const bullet = this.bullets[bulletIndex] as ClientBullet;
    this.bulletContainer.removeChild(bullet.sprite);
    super._cleanupBullet(bulletIndex);
  }
}
