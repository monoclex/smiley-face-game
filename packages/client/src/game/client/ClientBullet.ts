import { Sprite } from "pixi.js";
import Bullet from "../Bullet";
import textures from "../textures";

export default class ClientBullet extends Bullet {
  sprite: Sprite;

  constructor(x: number, y: number, angle: number) {
    super(x, y, angle);
    this.sprite = new Sprite(textures.get("bullet"));
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
