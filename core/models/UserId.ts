import { number, Schema, Type } from "../../deps.ts";

export const UserIdSchema = Schema(number.gte(0).integer());
export type UserId = Type<typeof UserIdSchema>;
export const validateUserId = UserIdSchema.destruct();
