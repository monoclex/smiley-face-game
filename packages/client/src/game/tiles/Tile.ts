import { TileId, TileLayer } from "@smiley-face-game/common/types";
import type { ZBlock } from "@smiley-face-game/common/types";
import RenderCanvasParams from "./RenderCanvasParams";

export default interface Tile<TTileId extends TileId> {
  readonly id: TTileId;
  readonly layer: TileLayer;

  place(tile: Phaser.Tilemaps.Tile, tileState: ZBlock & { id: TTileId }): void;
  onRemove?(tile: Phaser.Tilemaps.Tile): void;
  renderCanvas(args: RenderCanvasParams<TTileId>): void;
}
