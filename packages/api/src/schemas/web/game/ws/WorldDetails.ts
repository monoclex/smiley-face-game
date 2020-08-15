import Schema, { Type } from "computed-types";
import { WorldIdSchema } from "../../../WorldId";
import { DynamicWidthSchema } from "./DynamicWidth";
import { DynamicHeightSchema } from "./DynamicHeight";
import { DynamicWorldNameSchema } from "./DynamicWorldName";

export const WorldDetailsSchema = Schema.either({
  // "dynamic" worlds are ones that can be created *on demand*, without an account. They aren't saved.
  type: "dynamic" as const,
  id: WorldIdSchema.optional(),
  name: DynamicWorldNameSchema,
  width: DynamicWidthSchema,
  height: DynamicHeightSchema,
}, {
  // "saved" worlds are ones that must be loaded from the database. They are owned by players.
  type: "saved" as const,
  id: WorldIdSchema,
});
export type WorldDetails = Type<typeof WorldDetailsSchema>;
export const validateWorldDetails = WorldDetailsSchema.destruct();
