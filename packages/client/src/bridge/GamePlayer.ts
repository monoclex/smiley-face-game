import { Container, Sprite } from "pixi.js";
import textures from "../game/textures";

export default class GamePlayer {
  container: Container;
  cosmetic: Sprite;
  sprite: Sprite;
  gun: Sprite;

  constructor() {
    this.container = new Container();
    this.cosmetic = new Sprite(textures.get("smile"));
    this.sprite = new Sprite(textures.get("player"));
    this.gun = new Sprite(textures.get("gun"));
    this.gun.visible = false;

    this.container.addChild(this.sprite, this.cosmetic, this.gun);
  }

  cleanup() {
    this.container.destroy({ children: true });
  }
}
