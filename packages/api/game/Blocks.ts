import { TileLayer, ZHeap, ZWorldBlocks } from "../types";
import { Vector } from "../physics/Vector";
import { bresenhamsLine } from "../misc";
import TileRegistration from "../tiles/TileRegistration";
import { createNanoEvents } from "../nanoevents";

interface BlockEvents {
  load(blocks: ZWorldBlocks): void;
  block(layer: TileLayer, position: Vector, blockId: number, playerId: number): void;
}

export class Blocks {
  state!: number[][][];

  readonly events = createNanoEvents<BlockEvents>();

  constructor(readonly tiles: TileRegistration, blocks: ZWorldBlocks, readonly size: Vector) {
    this.load(blocks);
  }

  load(blocks: ZWorldBlocks) {
    this.state = [];

    // the server will not send us empty layers so we have to fill those in ourselves
    for (let layer = TileLayer.Foreground; layer <= TileLayer.Decoration; layer++) {
      const layerBlocks = blocks[layer];

      if (layerBlocks === undefined || layerBlocks === null) {
        this.state[layer] = Blocks.makeLayer(this.size, 0);
        continue;
      } else {
        this.state[layer] = layerBlocks;
      }

      for (let y = 0; y < this.size.y; y++) {
        const yBlocks = layerBlocks[y];

        if (yBlocks === undefined || yBlocks === null) {
          layerBlocks[y] = Blocks.makeYs(this.size, 0);
          continue;
        }

        for (let x = 0; x < this.size.x; x++) {
          const xBlock = yBlocks[x];

          if (xBlock === undefined || xBlock === null) {
            throw new Error("an individual block should never be null/undef");
          }
        }
      }
    }

    this.events.emit("load", this.state);
  }

  clear() {
    const state = Blocks.emptyWorld(this.size);
    Blocks.placeBorder(state, this.tiles, this.size);
    this.load(state);
  }

  placeLine(
    layer: TileLayer,
    start: Vector,
    end: Vector,
    blockId: number,
    playerId: number,
    heap?: ZHeap
  ): boolean {
    let didModify = false;

    bresenhamsLine(start.x, start.y, end.x, end.y, (x, y) => {
      const placed = this.placeSingle(layer, { x, y }, blockId, playerId, heap);
      didModify ||= placed;
    });

    return didModify;
  }

  placeSingle(
    layer: TileLayer,
    position: Vector,
    blockId: number,
    playerId: number,
    heap?: ZHeap
  ): boolean {
    if (position.x < 0 || position.y < 0) return false;
    if (position.x >= this.size.x || position.y >= this.size.y) return false;

    const value = this.state[layer][position.y][position.x];
    if (value === blockId) return false;

    this.state[layer][position.y][position.x] = blockId;
    this.events.emit("block", layer, position, blockId, playerId);
    return true;
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

  layerOfTopmostBlock(x: number, y: number) {
    if (this.state[TileLayer.Decoration][y][x] !== 0) return TileLayer.Decoration;
    for (let layer = TileLayer.Foreground; layer <= TileLayer.Background; layer++) {
      if (this.state[layer][y][x] !== 0) return layer;
    }
    return TileLayer.Foreground;
  }

  private static emptyWorld(size: Vector): number[][][] {
    const state = [];

    for (let idxLayer = TileLayer.Foreground; idxLayer <= TileLayer.Decoration; idxLayer++) {
      const layer = Blocks.makeLayer(size, 0);
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

  static makeLayer<T = 0>(size: Vector, value: T): T[][] {
    const layer = [];
    for (let idxY = 0; idxY < size.y; idxY++) {
      const y = Blocks.makeYs(size, value);
      layer[idxY] = y;
    }
    return layer;
  }

  static makeYs<T>(size: Vector, value: T): T[] {
    const y = [];
    for (let idxX = 0; idxX < size.x; idxX++) {
      y[idxX] = value;
    }
    return y;
  }
}
