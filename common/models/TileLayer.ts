import Schema from "computed-types";

export enum TileLayer {
  Foreground = 0,
  Action = 1,
  Background = 2,
}
export const TileLayerSchema = Schema.enum(TileLayer);

export function swapLayer(layer: TileLayer): TileLayer {
  if (layer === TileLayer.Action) return layer;
  return (layer === TileLayer.Foreground) ? (TileLayer.Background) : (TileLayer.Foreground);
}
