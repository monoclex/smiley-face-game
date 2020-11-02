import { Block } from "@smiley-face-game/schemas/Block";
import { TileId } from "@smiley-face-game/schemas/TileId";

/**
 * The argument in the `renderCanvas` function. This is put as an object because there's
 * a lot of conditional state that may or may not be used.
 */
export default interface RenderCanvasParams<TTileId extends TileId> {
  getFrame(index: number): { atlas: HTMLImageElement; x: number; y: number; width: number; height: number };
  block: Block & { id: TTileId };
  renderImageCanvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}
