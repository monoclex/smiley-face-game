import { Type, string } from "computed-types";

export const DynamicWorldNameSchema = string.min(1).max(64);
export type DynamicWorldName = Type<typeof DynamicWorldNameSchema>;
export const validateDynamicWorldName = DynamicWorldNameSchema.destruct();
