import Schema, { Type } from "computed-types";
import { TileId } from "./TileId";
import { RotationSchema } from "./Rotation";

// TODO: way to constrain maximum number?
export const BlockSchema = Schema.either({
  id: TileId.Empty as const,
}, {
  id: TileId.Full as const,
}, {
  id: TileId.Gun as const,
}, {
  id: TileId.Arrow as const,
  rotation: RotationSchema
});
export type Block = Type<typeof BlockSchema>;
export const validateBlock = BlockSchema.destruct();
