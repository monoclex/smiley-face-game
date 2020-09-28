import TileState from "@/game/tiles/TileState";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import Tile from "./Tile";

export default class EmptyTile implements Tile<TileId.Empty> {
  id: TileId.Empty = TileId.Empty;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile, tileState: TileState & { id: TileId.Empty }): void {
    tile.index = -1;
    tile.setCollision(false);
  }
}
