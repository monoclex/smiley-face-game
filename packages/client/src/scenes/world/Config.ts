import { TileId } from "@smiley-face-game/api/src/schemas/TileId";

export const TILE_WIDTH = 32;
export const TILE_HEIGHT = 32;

export interface WorldConfig {
  readonly width: number;
  readonly height: number;
  readonly blocks: TileId[][][];
}
