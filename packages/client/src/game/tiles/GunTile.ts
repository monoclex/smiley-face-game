import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import Tile from "./Tile";

export default class GunTile implements Tile {
  id: TileId = TileId.Gun;
  layer: TileLayer = TileLayer.Action;

  // TODO: collision handlers
  place(tile: Phaser.Tilemaps.Tile): void {
    tile.index = this.id;
    tile.setCollision(false);
  }

  onRemove() {
    
  }
}
