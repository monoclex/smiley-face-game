import Schema, { Type, number } from "computed-types";
import { WorldNameSchema } from "./WorldName";

export const WorldDetailsSchema = Schema({
  name: WorldNameSchema,
  width: number.min(3).max(100),
  height: number.min(3).max(100),
});
export type WorldDetails = Type<typeof WorldDetailsSchema>;
export const validateWorldDetails = WorldDetailsSchema.destruct();
