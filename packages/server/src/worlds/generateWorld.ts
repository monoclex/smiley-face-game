import { Block } from "@smiley-face-game/api/schemas/Block";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";

export default function generateWorld(width: number, height: number): string {
  // by using this one block, every single block in this array shares the same reference
  // but it allows this generator function to use less RAM, and if the user wants to use the blocks they can JSON.parse it
  const solid = { id: TileId.Full };

  const layers = [];
  const foreground: Block[][] = [];
  layers[TileLayer.Foreground] = foreground;

  const solidLineAcrossX: Block[] = [];

  for (let x = 0; x < width; x++) {
    solidLineAcrossX.push(solid);
  }

  const sidelines: Block[] = [];
  sidelines[0] = solid;
  sidelines[width - 1] = solid;
  
  foreground[0] = solidLineAcrossX;
  for (let y = 1; y < height - 1; y++) {
    foreground[y] = sidelines;
  }
  foreground[height - 1] = solidLineAcrossX;

  return JSON.stringify(layers);
}
