import Schema, { number, Type } from "computed-types";

// TODO: way to constrain maximum number?
export const BlockPositionSchema = Schema({
  x: number.gte(0).integer(),
  y: number.gte(0).integer(),
});
export type BlockPosition = Type<typeof BlockPositionSchema>;
export const validateBlockPosition = BlockPositionSchema.destruct();

export const BoundlessBlockPositionSchema = Schema({
  x: number.integer(),
  y: number.integer(),
});
export type BoundlessBlockPosition = Type<typeof BoundlessBlockPositionSchema>;
export const validateBoundlessBlockPosition = BoundlessBlockPositionSchema.destruct();
