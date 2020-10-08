import urlBullet from "../../../assets/bullet.png";
import urlShoot from "../../../assets/shoot.mp3";
import ComponentDisplay from "../../../game/components/ComponentDisplay";
import BulletConfig from "./BulletConfig";
import BulletType from "./BulletType";

function key(bulletType: BulletType) {
  return "bullet-" + bulletType;
}

export default class BulletDisplay implements ComponentDisplay {
  readonly sprite: Phaser.Physics.Matter.Image;

  static load(loader: Phaser.Loader.LoaderPlugin) {
    loader.image(key("bullet"), urlBullet);
    loader.audio("shoot", urlShoot);
  }

  constructor(scene: Phaser.Scene, config: BulletConfig) {
    const {
      bulletType,
      position: { x, y },
      angle,
    } = config;

    // TODO: consolidate default value in one place (`bulletType`)
    this.sprite = scene.matter.add.image(x, y, key(bulletType ?? "bullet"), undefined, {
      restitution: 0,
      friction: 0,
      // really dense so it makes a big impact on players
      density: 1,
      angle: angle,
    });
  }

  get depth() {
    return this.sprite.depth;
  }

  set depth(value) {
    this.sprite.depth = value;
  }
}
