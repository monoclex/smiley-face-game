import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import Tile from "./Tile";

export default class FullTile implements Tile<TileId.Full> {
  id: TileId.Full = TileId.Full;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile): void {
    tile.index = this.id;
    tile.setCollision(true);
  }
}
