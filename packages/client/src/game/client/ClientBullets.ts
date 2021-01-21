import { Container } from "pixi.js";
import Bullets from "../Bullets";
import ClientBullet from "./components/ClientBullet";
import ClientPlayer from "./components/ClientPlayer";

export default class ClientBullets extends Bullets {
  constructor(private readonly bulletContainer: Container) {
    super();
  }

  spawn(at: ClientPlayer, angle: number) {
    // TODO: put bullet in front of gun, not at player
    const bullet = new ClientBullet(at.position.x, at.position.y, angle);

    this.bulletContainer.addChild(bullet.sprite);

    // TODO: definitely a hack because duplicated code
    setTimeout(() => {
      this.bulletContainer.removeChild(bullet.sprite);
      bullet.sprite.destroy({ children: true });
    }, 2000);

    super._spawnBullet(bullet);
  }
}
