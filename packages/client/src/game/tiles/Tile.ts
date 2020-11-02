import TileState from "../../game/tiles/TileState";
import { TileId } from "@smiley-face-game/schemas/TileId";
import { TileLayer } from "@smiley-face-game/schemas/TileLayer";
import RenderCanvasParams from "./RenderCanvasParams";

export default interface Tile<TTileId extends TileId> {
  readonly id: TTileId;
  readonly layer: TileLayer;

  place(tile: Phaser.Tilemaps.Tile, tileState: TileState & { id: TTileId }): void;
  onRemove?(tile: Phaser.Tilemaps.Tile): void;
  renderCanvas(args: RenderCanvasParams<TTileId>): void;
}
