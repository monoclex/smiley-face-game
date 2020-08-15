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

  for (let y = 0; y < height; y++) {
    const yLayer: Block[] = [];
    foreground[y] = yLayer;

    for (let x = 0; x < width; x++) {
      yLayer[x] = solid;
    }
  }

  return JSON.stringify(layers);
}
