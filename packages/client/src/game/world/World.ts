import { TileLayer } from "@smiley-face-game/common/types";
import type { ZBlock, ZSize, ZWorldBlocks } from "@smiley-face-game/common/types";
import Position from "../../math/Position";
import Layer from "../../game/components/layer/Layer";
import Void from "../../game/components/void/Void";
import TileManager from "./TileManager";
import { bresenhamsLine } from "@smiley-face-game/common/misc";
import tileLookup from "../../game/tiles/tileLookup";
import { Connection } from "@smiley-face-game/common";
import type { TileEx } from "../../phaser-tile-addons";
import type TileRegistration from "@smiley-face-game/common/tiles/TileRegistration";

export default class World {
  readonly tileManager: TileManager;

  readonly decoration: Layer;
  readonly foreground: Layer;
  readonly action: Layer;
  readonly background: Layer;
  readonly void: Void;
  tileJson: TileRegistration;

  constructor(scene: Phaser.Scene, readonly size: ZSize, readonly connection: Connection) {
    this.tileJson = connection.tileJson;
    this.tileManager = new TileManager(scene, size, this.tileJson);
    this.decoration = new Layer(this.tileManager, "decoration");
    this.foreground = new Layer(this.tileManager, "foreground");
    this.action = new Layer(this.tileManager, "action");
    this.background = new Layer(this.tileManager, "background");
    this.void = new Void(scene, this.tileManager);
  }

  layerFor(tileLayer: TileLayer): Layer {
    // TODO: lookup obj
    if (tileLayer === TileLayer.Decoration) return this.decoration;
    else if (tileLayer === TileLayer.Foreground) return this.foreground;
    else if (tileLayer === TileLayer.Action) return this.action;
    else if (tileLayer === TileLayer.Background) return this.background;
    throw new Error("ok?");
  }

  deserializeBlocks(blocks: ZWorldBlocks) {
    for (let l = 0; l < blocks.length; l++) {
      const layer = blocks[l];

      for (let y = 0; y < layer.length; y++) {
        const yLayer = layer[y];

        for (let x = 0; x < yLayer.length; x++) {
          const block = yLayer[x];

          this.placeBlock({ x, y }, block, l, false);
        }
      }
    }

    console.timeEnd("init");
  }

  clear() {
    // no idea if this is a performance optimization or not. but hopefully, this will be slightly GC friendly
    let position = { x: 0, y: 0 };

    for (let l = 0; l < TileLayer.Decoration; l++) {
      for (let y = 0; y < this.size.height; y++) {
        position.y = y;
        for (let x = 0; x < this.size.width; x++) {
          position.x = x;

          this.placeBlock(position, 0, l, false);
        }
      }
    }
  }

  placeBlock(position: Position, tileState: ZBlock, layer: TileLayer | undefined, iPlacedIt: boolean) {
    const { x, y } = position;

    const behavior = this.tileJson.for(tileState);
    const tileBreed = tileLookup[behavior.behavior];
    const actualLayer = layer ?? behavior.layer;
    const tile: TileEx = this.layerFor(actualLayer).display.tilemapLayer.getTileAt(x, y, true);

    // don't do anything as they are the same
    if (tile.tileState && tileState === tile.tileState) {
      return;
    }
    if (tileState === 0 && tile.index === -1) return; // special case for empty tiles

    //@ts-ignore
    const tileIndex: TileId = tile.index;

    if (tile.tileState) {
      const result = tileLookup[this.tileJson.for(tile.tileState).behavior];
      if (result !== undefined && result.remove) {
        result.remove(this.tileJson, tile);
      }
    }

    // TODO: if this turns into a reference, make sure to copy the value (not the reference)
    tile.tileState = tileState;

    tileBreed.place(this.tileJson, tile, tileState);

    if (iPlacedIt) {
      this.connection.place(tileState, position, actualLayer);
    }
  }

  // TODO: put this in something that handles tile layers
  drawLine(start: Position, end: Position, tile: ZBlock, iPlacedIt: boolean, layer?: TileLayer) {
    bresenhamsLine(start.x, start.y, end.x, end.y, (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= this.tileManager.tilemap.width || y >= this.tileManager.tilemap.height) return;
      this.placeBlock({ x, y }, tile, layer, iPlacedIt);
    });
  }
}
