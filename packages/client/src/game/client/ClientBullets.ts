import { Container } from "pixi.js";
import Bullets from "../Bullets";
import Timer from "../Timer";
import ClientBullet from "./components/ClientBullet";
import ClientPlayer from "./components/ClientPlayer";

export default class ClientBullets extends Bullets {
  constructor(timer: Timer, private readonly bulletContainer: Container) {
    super(timer);
  }

  spawn(at: ClientPlayer, angle: number) {
    // TODO: put bullet in front of gun, not at player
    const bullet = new ClientBullet(at.position.x, at.position.y, angle);

    this.bulletContainer.addChild(bullet.sprite);

    super._spawnBullet(bullet);
  }

  _cleanupBullet(bullet: ClientBullet) {
    this.bulletContainer.removeChild(bullet.sprite);
    super._cleanupBullet(bullet);
  }
}
