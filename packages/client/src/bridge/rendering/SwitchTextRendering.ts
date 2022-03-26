import { Game, TileLayer } from "@smiley-face-game/api";
import { HeapKind } from "@smiley-face-game/api/tiles/register";
import { Container, Text } from "pixi.js";

export default class SwitchTextRendering {
  sprites: Map<number, Text> = new Map();
  switchTextLayer: Container = new Container();

  constructor(public readonly game: Game) {
    game.blocks.events.on("load", (blocks) => {
      this.handleLoad(blocks);
    });

    game.blocks.events.on("block", (layer, { x, y }, id) => {
      console.log("got block event");
      this.triggerBlock(id, layer, x, y);
    });

    this.handleLoad(game.blocks.state.state);
  }

  private handleLoad(blocks: number[][][]) {
    for (let layerIdx = 0; layerIdx < blocks.length; layerIdx++) {
      const layer = blocks[layerIdx];
      if (layer == null) continue;
      for (let yIdx = 0; yIdx < layer.length; yIdx++) {
        const y = layer[yIdx];
        if (y == null) continue;
        for (let xIdx = 0; xIdx < y.length; xIdx++) {
          if (y[xIdx] == null) continue;
          this.triggerBlock(y[xIdx], layerIdx, xIdx, yIdx);
        }
      }
    }
  }

  private triggerBlock(id: number, layer: TileLayer, x: number, y: number) {
    const blockInfo = this.game.tiles.forId(id);

    if (blockInfo.heap === HeapKind.Switch) {
      const heap = this.game.blocks.heap.get(layer, x, y);

      if (heap !== 0 && heap.kind === "switch") {
        this.showId(layer, x, y, heap.id);
        return;
      }
    }

    this.hideId(layer, x, y);
  }

  showId(layer: number, x: number, y: number, id: number) {
    const index = this.index(layer, x, y);

    let text = this.sprites.get(index);
    if (!text) {
      text = new Text("", { fill: "white", fontFamily: "monospace", fontSize: "10px" });
      text.visible = true;

      this.switchTextLayer.addChild(text);
    }

    text.text = `${id}`;

    const TILE_SIZE = 32;
    text.x = (x + 1) * TILE_SIZE - text.width;
    text.y = (y + 1) * TILE_SIZE - text.height;

    this.sprites.set(index, text);
  }

  hideId(layer: number, x: number, y: number) {
    const index = this.index(layer, x, y);
    const sprite = this.sprites.get(index);

    if (sprite) {
      this.switchTextLayer.removeChild(sprite);
      this.sprites.delete(index);
    }
  }

  index(layer: number, x: number, y: number): number {
    return (
      layer * (this.game.blocks.width * this.game.blocks.height) + y * this.game.blocks.width + x
    );
  }
}
