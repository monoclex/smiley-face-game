import Component from "@/game/components/Component";
import BulletConfig from "./BulletConfig";
import BulletDisplay from "./BulletDisplay";
import BulletType from "./BulletType";

export default class Bullet implements Component {
  readonly display: BulletDisplay;
  readonly bulletType: BulletType;

  constructor(scene: Phaser.Scene, bulletConfig: BulletConfig) {
    this.display = new BulletDisplay(scene, bulletConfig);
    this.bulletType = bulletConfig.bulletType ?? "bullet"; // TODO: consolidate default value in one place
  }
}
