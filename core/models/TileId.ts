import { Schema } from "../../deps.ts";

export enum TileId {
  Empty = 0,
  Full = 1,
}
export const TileIdSchema = Schema.enum(TileId);
