import Schema, { Type } from "computed-types";
import { UsernameSchema } from "@smiley-face-game/common/schemas/Username";

export const GuestSchema = Schema({
  username: UsernameSchema,
});
export type Guest = Type<typeof GuestSchema>;
export const validateGuest = GuestSchema.destruct();
