import { Sprite } from "pixi.js";
import Game from "../../Game";
import Player from "../../components/Player";
import textures from "../../textures";

export default class ClientPlayer extends Player {
  sprite: Sprite;

  constructor(id: number, username: string, isGuest: boolean) {
    super(id, username, isGuest);
    this.sprite = new Sprite(textures.player);
  }

  tick(game: Game) {
    super.tick(game);
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;
  }
}
