import { TileLayer } from "@smiley-face-game/api/types";

export default interface ReadOnlyWorld {
  layerOfTopmostBlock(x: number, y: number): TileLayer;
  blockAt(x: number, y: number, layer: TileLayer): number;
}
