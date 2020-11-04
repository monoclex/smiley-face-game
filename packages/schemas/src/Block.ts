import Schema, { SchemaInput } from "computed-types";
import { TileId } from "./TileId";
import { RotationSchema } from "./Rotation";
import { ColorSchema } from "./Color";
import { PrismarineVariantSchema } from "./PrismarineVariantSchema";

// TODO: way to constrain maximum number?
export const BlockSchema = Schema.either(
  {
    id: TileId.Empty as const,
  },
  {
    id: TileId.Basic as const,
    color: ColorSchema.optional(),
  },
  {
    id: TileId.Gun as const,
  },
  {
    id: TileId.Arrow as const,
    rotation: RotationSchema,
  },
  {
    id: TileId.Prismarine as const,
    variant: PrismarineVariantSchema,
  }
);
export type Block = SchemaInput<typeof BlockSchema>;
export const validateBlock = BlockSchema.destruct();
