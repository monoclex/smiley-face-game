import { TileId } from "@smiley-face-game/schemas/TileId";
import { TileLayer } from "@smiley-face-game/schemas/TileLayer";
import Tile from "./Tile";

export default class EmptyTile implements Tile<TileId.Empty> {
  id: TileId.Empty = TileId.Empty;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile): void {
    tile.index = -1;
    tile.setCollision(false);
  }
}
