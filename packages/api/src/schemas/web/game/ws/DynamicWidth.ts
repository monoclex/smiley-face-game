import { Type, number } from "computed-types";

// The width allowed by a dynamic world.

export const DynamicWidthSchema = number.min(3).max(50).integer();
export type DynamicWidth = Type<typeof DynamicWidthSchema>;
export const validateDynamicWidth = DynamicWidthSchema.destruct();
