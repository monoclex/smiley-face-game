import { TileLayer, ZWorldBlocks } from "../types";
import { Vector } from "../physics/Vector";
import { bresenhamsLine } from "../misc";
import TileRegistration from "../tiles/TileRegistration";

export class Blocks {
  state: number[][][];

  /**
   * Event handler that gets fired whenever the state of the world gets
   * completely changed.
   */
  onLoad?: (blocks: ZWorldBlocks) => void;

  /**
   * Event handler that gets fired whenever a block is placed.
   */
  onBlock?: (layer: TileLayer, position: Vector, blockId: number, playerId: number) => void;

  constructor(readonly tiles: TileRegistration, blocks: ZWorldBlocks, readonly size: Vector) {
    this.state = blocks;
  }

  load(blocks: ZWorldBlocks) {
    this.state = blocks;
    if (this.onLoad) this.onLoad(this.state);
  }

  clear() {
    const state = Blocks.emptyWorld(this.size);
    Blocks.placeBorder(state, this.tiles, this.size);
    this.load(state);
  }

  placeLine(layer: TileLayer, start: Vector, end: Vector, blockId: number, playerId: number) {
    bresenhamsLine(start.x, start.y, end.x, end.y, (x, y) => {
      this.placeSingle(layer, { x, y }, blockId, playerId);
    });
  }

  placeSingle(layer: TileLayer, position: Vector, blockId: number, playerId: number) {
    if (position.x < 0 || position.y < 0) return;
    if (position.x >= this.size.x || position.y >= this.size.y) return;

    this.state[layer][position.y][position.x] = blockId;
    if (this.onBlock) this.onBlock(layer, position, blockId, playerId);
  }

  blockAt(x: number, y: number, tileLayer: TileLayer): number {
    err: {
      const layer = this.state[tileLayer];
      if (!layer) break err;

      const ys = layer[y];
      if (ys === undefined) break err;

      const block = ys[x];
      if (block === undefined) break err;

      return block;
    }

    throw new Error(`out of bounds block get attempt: ${tileLayer}: (${x}, ${y})`);
  }

  private static emptyWorld(size: Vector): number[][][] {
    const state = [];

    for (let idxLayer = TileLayer.Foreground; idxLayer <= TileLayer.Decoration; idxLayer++) {
      const layer = [];
      for (let idxY = 0; idxY < size.y; idxY++) {
        const y = [];
        for (let idxX = 0; idxX < size.x; idxX++) {
          y[idxX] = 0;
        }
        layer[idxY] = y;
      }
      state[idxLayer] = layer;
    }

    return state;
  }

  private static placeBorder(state: number[][][], tileJson: TileRegistration, size: Vector) {
    const layer = state[TileLayer.Foreground];
    const block = tileJson.id("basic-white");

    const top = layer[0];
    const bottom = layer[size.y - 1];

    for (let x = 0; x < size.x; x++) {
      top[x] = bottom[x] = block;
    }

    const rightEndOfWorld = size.x - 1;
    for (let idxY = 1; idxY < size.y - 2; idxY++) {
      const y = layer[idxY];
      y[0] = y[rightEndOfWorld] = block;
    }
  }
}
