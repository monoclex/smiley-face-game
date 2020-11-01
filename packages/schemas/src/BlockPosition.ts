import Schema, { number, Type } from "computed-types";

export type BlockPositionSchema = ReturnType<typeof blockPosition>["BlockPositionSchema"];
export type BlockPosition = Type<BlockPositionSchema>;
export function blockPosition(maxX: number, maxY: number) {
  const BlockPositionSchema = Schema({
    x: number.gte(0).lte(maxX).integer(),
    y: number.gte(0).lte(maxY).integer(),
  });

  const validateBlockPosition = BlockPositionSchema.destruct();

  return { BlockPositionSchema, validateBlockPosition };
}

export const BoundlessBlockPositionSchema = Schema({
  x: number.integer(),
  y: number.integer(),
});
export type BoundlessBlockPosition = Type<typeof BoundlessBlockPositionSchema>;
export const validateBoundlessBlockPosition = BoundlessBlockPositionSchema.destruct();
