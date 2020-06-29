import { Schema, Type } from "../../deps.ts";
import { TileIdSchema } from './TileId.ts';

// TODO: way to constrain maximum number?
export const BlockSchema = Schema({
  id: TileIdSchema,
});
export type Block = Type<typeof BlockSchema>;
export const validateBlock = BlockSchema.destruct();
