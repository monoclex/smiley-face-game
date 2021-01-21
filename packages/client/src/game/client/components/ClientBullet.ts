import { Sprite } from "pixi.js";
import Bullet from "../../components/Bullet";
import textures from "../../textures";

let id = 0;

export default class ClientBullet extends Bullet {
  id: number;
  sprite: Sprite;

  constructor(x: number, y: number, angle: number) {
    super(x, y, angle);
    this.id = id++;
    this.sprite = new Sprite(textures.bullet);
    this.sprite.visible = true;
  }

  tick() {
    super.tick();
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;
  }

  cleanup() {
    this.sprite.destroy({ children: true });
    super.cleanup();
  }
}
