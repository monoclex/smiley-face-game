import urlBullet from "../../../assets/bullet.png";
import urlShoot from "../../../assets/shoot.mp3";
import BulletType from "./BulletType";

function key(bulletType: BulletType) {
  return "bullet-" + bulletType;
}

export default class BulletDisplay {
  static load(loader: Phaser.Loader.LoaderPlugin) {
    loader.image(key("bullet"), urlBullet);
    loader.audio("shoot", urlShoot);
  }
}
