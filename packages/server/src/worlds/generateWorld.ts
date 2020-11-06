import type { ZBlock } from "@smiley-face-game/common/types";
import { TileId, TileLayer } from "@smiley-face-game/common/types";

export default function generateWorld(width: number, height: number): string {
  // by using this one block, every single block in this array shares the same reference
  // but it allows this generator function to use less RAM, and if the user wants to use the blocks they can JSON.parse it
  const solid = { id: TileId.Basic } as const;

  const layers = [];
  const foreground: ZBlock[][] = [];
  layers[TileLayer.Foreground] = foreground;

  const solidLineAcrossX: ZBlock[] = [];

  for (let x = 0; x < width; x++) {
    solidLineAcrossX.push(solid);
  }

  const sidelines: ZBlock[] = [];
  sidelines[0] = solid;
  sidelines[width - 1] = solid;

  foreground[0] = solidLineAcrossX;
  for (let y = 1; y < height - 1; y++) {
    foreground[y] = sidelines;
  }
  foreground[height - 1] = solidLineAcrossX;

  return JSON.stringify(layers);
}
