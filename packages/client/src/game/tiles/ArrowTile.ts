import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import Tile from "./Tile";

export default class ArrowTile implements Tile {
  id: TileId = TileId.Arrow;
  layer: TileLayer = TileLayer.Action;

  place(tile: Phaser.Tilemaps.Tile): void {
    tile.index = this.id;
    tile.setCollision(false);
  }
}
