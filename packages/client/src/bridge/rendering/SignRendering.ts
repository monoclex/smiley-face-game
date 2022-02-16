import { Game, TileLayer } from "@smiley-face-game/api";
import { Text } from "pixi.js";

export default class SignRendering {
  readonly sprite: Text;

  private readonly layer: TileLayer;
  private readonly signId: number;

  x = -1;
  y = -1;

  constructor(readonly game: Game) {
    this.sprite = new Text("asdf", { fill: "white" });
    this.sprite.visible = false;
    this.sprite.anchor.set(0.5, 0.5);

    const sign = game.tiles.forTexture("sign");
    this.signId = sign.id;
    this.layer = sign.preferredLayer;

    this.game.physics.events.on("signOn", (x, y) => {
      this.x = x;
      this.y = y;
    });

    this.game.physics.events.on("signOff", () => {
      // actually i like it if the text stays on screen
      // this.sprite.visible = false;
    });
  }

  draw() {
    this.sprite.visible = false;

    if (this.x == -1 || this.y == -1) return;

    const block = this.game.blocks.blockAt(this.x, this.y, this.layer);
    if (block !== this.signId) return;

    const heap = this.game.blocks.heap.get(this.layer, this.x, this.y);
    if (heap === 0 || heap.kind !== "sign") return;

    this.sprite.text = heap.text;
    this.sprite.updateText(true);
    this.sprite.x = 32 * this.x + 16;
    this.sprite.y = 32 * (this.y - 1);
    this.sprite.visible = true;
  }
}
