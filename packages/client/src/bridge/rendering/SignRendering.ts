import { Game } from "@smiley-face-game/api";
import { Text } from "pixi.js";

export default class SignRendering {
  readonly sprite: Text;

  constructor(readonly game: Game) {
    this.sprite = new Text("asdf", { fill: "white" });
    this.sprite.visible = false;
    this.sprite.anchor.set(0.5, 0.5);

    const sign = game.tiles.forTexture("sign");
    const layer = sign.preferredLayer;

    this.game.physics.events.on("signOn", (x, y) => {
      const heap = this.game.blocks.heap.get(layer, x, y);
      if (heap === 0 || heap.kind !== "sign") return;

      this.sprite.text = heap.text;
      this.sprite.updateText(true);
      this.sprite.x = 32 * x;
      this.sprite.y = 32 * (y - 1);
      this.sprite.visible = true;
    });

    this.game.physics.events.on("signOff", () => {
      // actually i like it if the text stays on screen
      // this.sprite.visible = false;
    });
  }
}
