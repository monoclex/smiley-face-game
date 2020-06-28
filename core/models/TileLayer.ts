import { Schema } from "../../deps.ts";

export enum TileLayer {
  Foreground = 0,
  Background = 1,
}
export const TileLayerSchema = Schema.enum(TileLayer);

export function swapLayer(layer: TileLayer): TileLayer {
  return (layer === TileLayer.Foreground) ? (TileLayer.Background) : (TileLayer.Foreground);
}
