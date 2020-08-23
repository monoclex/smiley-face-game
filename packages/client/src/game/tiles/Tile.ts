import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";

export default interface Tile {
  readonly id: TileId;
  readonly layer: TileLayer;
  place(tile: Phaser.Tilemaps.Tile): void;
  onRemove?(): void;
}
