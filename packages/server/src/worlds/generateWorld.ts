import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/src/schemas/TileLayer";

export default function generateWorld(width: number, height: number): string {
  const solid = { id: TileId.Full };

  const layers = [];
  const foreground: { id: TileId }[][] = [];
  layers[TileLayer.Foreground] = foreground;

  for (let y = 0; y < height; y++) {
    const yLayer: { id: TileId }[] = [];
    foreground[y] = yLayer;

    for (let x = 0; x < width; x++) {
      yLayer[x] = solid;
    }
  }

  return JSON.stringify(layers);
}
