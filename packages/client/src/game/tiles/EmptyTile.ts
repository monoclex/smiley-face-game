import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import Tile from "./Tile";

export default class EmptyTile implements Tile {
  id: TileId = TileId.Empty;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile): void {
    tile.index = -1;
    tile.setCollision(false);
  }
}
