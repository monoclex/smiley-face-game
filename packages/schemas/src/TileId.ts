import Schema from "computed-types";

export enum TileId {
  Empty = 0,
  Basic = 1,
  Gun = 2,
  Arrow = 3,
  Prismarine = 4,
}
export const TileIdSchema = Schema.enum(TileId);
