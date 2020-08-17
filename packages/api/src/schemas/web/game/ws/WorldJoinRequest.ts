import Schema, { Type } from "computed-types";
import { WorldIdSchema } from "../../../WorldId";
import { DynamicWidthSchema } from "./DynamicWidth";
import { DynamicHeightSchema } from "./DynamicHeight";
import { WorldNameSchema } from "../../../WorldName";

export const WorldJoinRequestSchema = Schema.either({
  // "dynamic" worlds are ones that can be created *on demand*, without an account. They aren't saved.
  type: "dynamic" as const,
  name: WorldNameSchema,
  width: DynamicWidthSchema,
  height: DynamicHeightSchema,
}, {
  // "saved" worlds are ones that must be loaded from the database. They are owned by players.
  type: "saved" as const,
  id: WorldIdSchema,
}, {
  type: "dynamic" as const,
  id: WorldIdSchema,
});
export type WorldJoinRequest = Type<typeof WorldJoinRequestSchema>;
export const validateWorldJoinRequest = WorldJoinRequestSchema.destruct();
