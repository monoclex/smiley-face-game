import Schema from "computed-types";

export enum PrismarineVariant {
  Basic = 0,
  Anchor = 1,
  Brick = 2,
  Slab = 3,
  Crystal = 4,
}
export const PrismarineVariantSchema = Schema.enum(PrismarineVariant);
export const validatePrismarineVariant = PrismarineVariantSchema.destruct();
