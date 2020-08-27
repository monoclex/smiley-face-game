import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { Size } from "@smiley-face-game/api/schemas/Size";
import Position from "@/math/Position";
import Layer from "@/game/components/layer/Layer";
import Void from "@/game/components/void/Void";
import TileManager from "./TileManager";
import { bresenhamsLine } from "@smiley-face-game/api/misc";
import tileLookup from "@/game/tiles/tileLookup";
import Tile from "../tiles/Tile";
import { NetworkClient } from "@smiley-face-game/api/NetworkClient";

export default class World {
  readonly tileManager: TileManager;
  
  readonly decoration: Layer;
  readonly foreground: Layer;
  readonly action: Layer;
  readonly background: Layer;
  readonly void: Void;

  constructor(scene: Phaser.Scene, size: Size, readonly networkClient: NetworkClient) {
    this.tileManager = new TileManager(scene, size);
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

  deserializeBlocks(blocks: { id: TileId; }[][][]) {
    for (let l = 0; l < blocks.length; l++) {
      const layer = blocks[l];
      const worldLayer = l === TileLayer.Decoration ? this.decoration : l === TileLayer.Foreground ? this.foreground : l === TileLayer.Action ? this.action : this.background;

      for (let y = 0; y < layer.length; y++) {
        const yLayer = layer[y];

        for (let x = 0; x < yLayer.length; x++) {
          const block = yLayer[x];

          if (block.id !== 0) {
            const tile = worldLayer.display.tilemapLayer.putTileAt(block.id, x, y);
            tile.index = block.id;
            tile.setCollision(true);
          }
          else {
            const tile = worldLayer.display.tilemapLayer.getTileAt(x, y, true);
            tile.index = -1;
            tile.setCollision(false);
          }
        }
      }
    }

    console.timeEnd("init");
  }

  placeBlock(position: Position, id: TileId) {
    const { x, y } = position;

    const tileBreed = tileLookup[id];
    const tile = this.layerFor(tileBreed.layer).display.tilemapLayer.getTileAt(x, y, true);
    
    // don't do anything as they are the same
    if (tile.index === id) return;
    if (id === TileId.Empty && tile.index === -1) return; // special case for empty tiles

    // @ts-ignore
    const result: Tile = tileLookup[tile.index];
    if (result !== undefined && result.onRemove) {
      result.onRemove(tile);
    }

    tileBreed.place(tile);
    this.networkClient.placeBlock(position.x, position.y, id, tileBreed.layer);
  }

  // TODO: put this in something that handles tile layers
  drawLine(start: Position, end: Position, tileId: TileId) {
    bresenhamsLine(start.x, start.y, end.x, end.y, (x, y) => {
      if (x < 0 || y < 0 || x >= this.tileManager.tilemap.width || y >= this.tileManager.tilemap.height) return;
      this.placeBlock({ x, y }, tileId);
    });
  }
}