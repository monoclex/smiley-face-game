import Schema, { string, Type } from "computed-types";

export const UsernameSchema = Schema(string.max(32).min(3));
export type Username = Type<typeof UsernameSchema>;
export const validateUsername = UsernameSchema.destruct();
