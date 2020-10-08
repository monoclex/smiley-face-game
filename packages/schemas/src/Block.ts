import Schema from "computed-types";
import { TileId } from "./TileId";
import { RotationSchema, Rotation } from "./Rotation";
import { ColorSchema, Color } from "./Color";

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
export type Block =
  | { id: TileId.Empty }
  // because we need to declare the color as an optional here in order to keep type backwords compat,
  // we need to manually declare it as an optional value (.optional() just yields | undefined)
  | { id: TileId.Full, color?: Color }
  | { id: TileId.Gun }
  | { id: TileId.Arrow, rotation: Rotation }
  ;
export const validateBlock = BlockSchema.destruct();
