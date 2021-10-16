import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { TileLayer } from "@smiley-face-game/api/types";
import { bresenhamsLine } from "@smiley-face-game/api/misc";
import Size from "./interfaces/Size";
import Player from "./Player";

export default class World {
  protected state: number[][][];

  private static emptyWorld(size: Size): number[][][] {
    const state = [];

    for (let idxLayer = TileLayer.Foreground; idxLayer <= TileLayer.Decoration; idxLayer++) {
      const layer = [];
      for (let idxY = 0; idxY < size.height; idxY++) {
        const y = [];
        for (let idxX = 0; idxX < size.width; idxX++) {
          y[idxX] = 0;
        }
        layer[idxY] = y;
      }
      state[idxLayer] = layer;
    }

    return state;
  }

  private static placeBorder(state: number[][][], tileJson: TileRegistration, size: Size) {
    const layer = state[TileLayer.Foreground];
    const block = tileJson.id("basic-white");

    const top = layer[0];
    const bottom = layer[size.height - 1];

    for (let x = 0; x < size.width; x++) {
      top[x] = bottom[x] = block;
    }

    const rightEndOfWorld = size.width - 1;
    for (let idxY = 1; idxY < size.height - 2; idxY++) {
      const y = layer[idxY];
      y[0] = y[rightEndOfWorld] = block;
    }
  }

  constructor(protected readonly tileJson: TileRegistration, readonly size: Size) {
    this.state = World.emptyWorld(size);
  }

  layerOfTopmostBlock(x: number, y: number): TileLayer {
    // TODO: support decoration layers
    // this is set to background because server doesn't send decoration layer
    for (let layer = TileLayer.Foreground; layer <= TileLayer.Background; layer++) {
      if (this.state[layer][y][x] !== 0) return layer;
    }
    return TileLayer.Foreground;
  }

  blockAt(x: number, y: number, layer: TileLayer): number {
    return this.state[layer][y][x];
  }

  placeBlock(author: Player, x: number, y: number, id: number, layer?: TileLayer) {
    if (x < 0 || y < 0 || x >= this.size.width || y >= this.size.height) return;
    layer = layer ?? this.tileJson.for(id).layer;
    this.state[layer][y][x] = id;
    // this.onPlace(layer, y, x, id);
  }

  placeLine(author: Player, x1: number, y1: number, x2: number, y2: number, id: number, layerParam?: number) {
    const layer = layerParam ?? this.tileJson.for(id).layer;
    const stateLayer = this.state[layer];
    bresenhamsLine(x1, y1, x2, y2, (x, y) => {
      if (x < 0 || y < 0 || x >= this.size.width || y >= this.size.height) return;
      stateLayer[y][x] = id;
      // this.onPlace(layer, y, x, id);
    });
  }

  load(blocks: number[][][]) {
    this.state = blocks;
  }

  clear() {
    const state = World.emptyWorld(this.size);
    World.placeBorder(state, this.tileJson, this.size);
    this.load(state);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSave(author: Player) {
    // this method is called and might be overwritten later
  }

  onLoad(author: Player, blocks: number[][][]) {
    this.load(blocks);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClear(author: Player) {
    this.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPlace(layer: TileLayer, y: number, x: number, id: number) {
    //  this method is overwritten later
  }
}
