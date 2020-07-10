import Schema from "computed-types";

export enum TileId {
  Empty = 0,
  Full = 1,
  Gun = 2,
}
export const TileIdSchema = Schema.enum(TileId);
