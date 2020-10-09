import { Type, string } from "computed-types";

export const WorldNameSchema = string.min(1).max(64);
export type WorldName = Type<typeof WorldNameSchema>;
export const validateWorldName = WorldNameSchema.destruct();
