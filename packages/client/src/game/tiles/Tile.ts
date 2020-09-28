import TileState from "@/game/tiles/TileState";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";

export default interface Tile<TTileId extends TileId> {
  readonly id: TTileId;
  readonly layer: TileLayer;
  place(tile: Phaser.Tilemaps.Tile, tileState: TileState & { id: TTileId }): void;
  onRemove?(tile: Phaser.Tilemaps.Tile): void;
}
