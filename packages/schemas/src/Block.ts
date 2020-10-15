import Schema, { SchemaInput } from "computed-types";
import { TileId } from "./TileId";
import { RotationSchema } from "./Rotation";
import { ColorSchema } from "./Color";

// TODO: way to constrain maximum number?
export const BlockSchema = Schema.either(
  {
    id: TileId.Empty as const,
  },
  {
    id: TileId.Full as const,
    color: ColorSchema.optional(),
  },
  {
    id: TileId.Gun as const,
  },
  {
    id: TileId.Arrow as const,
    rotation: RotationSchema,
  }
);
export type Block = SchemaInput<typeof BlockSchema>;
export const validateBlock = BlockSchema.destruct();
