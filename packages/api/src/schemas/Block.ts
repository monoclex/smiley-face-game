import Schema, { Type } from "computed-types";
import { TileIdSchema } from './TileId';

// TODO: way to constrain maximum number?
export const BlockSchema = Schema({
  id: TileIdSchema,
});
export type Block = Type<typeof BlockSchema>;
export const validateBlock = BlockSchema.destruct();
