import { Container, Sprite } from "pixi.js";
import textures from "./textures";

function center(sprite: Sprite, relativeTo: Sprite) {
  sprite.position.x = -(sprite.width - relativeTo.width) / 2;
  sprite.position.y = -(sprite.height - relativeTo.height) / 2;
}

export default class GamePlayer {
  container: Container;
  cosmetic: Sprite;
  sprite: Sprite;
  gun: Sprite;
  wings: Sprite;

  constructor() {
    this.container = new Container();
    this.cosmetic = new Sprite(textures.get("smile"));
    this.sprite = new Sprite(textures.get("player"));
    this.gun = new Sprite(textures.get("gun"));
    this.gun.visible = false;
    this.wings = new Sprite(textures.get("wings-default"));
    this.wings.visible = false;
    center(this.wings, this.sprite);

    this.container.addChild(this.wings, this.sprite, this.cosmetic, this.gun);
  }

  cleanup() {
    this.container.destroy({ children: true });
  }
}
