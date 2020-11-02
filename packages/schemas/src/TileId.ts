import Schema from "computed-types";

export enum TileId {
  Empty = 0,
  Basic = 1,
  Gun = 2,
  Arrow = 3,
  Prismarine = 4,
  Chocolate = 5,
  Gemstone = 6,
  TurtleShell = 7,
  Pyramid = 8,
}
export const TileIdSchema = Schema.enum(TileId);
