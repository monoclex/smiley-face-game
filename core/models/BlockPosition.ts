import { number, Schema, Type } from "../../deps.ts";

// TODO: way to constrain maximum number?
export const BlockPositionSchema = Schema({
  x: number.gte(0).integer(),
  y: number.gte(0).integer(),
});
export type BlockPosition = Type<typeof BlockPositionSchema>;
export const validateBlockPosition = BlockPositionSchema.destruct();
