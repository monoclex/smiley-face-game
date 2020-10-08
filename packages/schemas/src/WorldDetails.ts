import Schema, { Type, number, string, unknown } from "computed-types";
import { WorldNameSchema } from "./WorldName";
import { UsernameSchema } from "./Username";
import { AccountIdSchema } from "./AccountId";

export const WorldDetailsSchema = Schema({
  name: WorldNameSchema,
  owner: UsernameSchema.optional(),
  ownerId: AccountIdSchema.optional(),
  width: number.min(3).max(100).integer(),
  height: number.min(3).max(100).integer(),
});
export type WorldDetails = Type<typeof WorldDetailsSchema>;
export const validateWorldDetails = WorldDetailsSchema.destruct();
