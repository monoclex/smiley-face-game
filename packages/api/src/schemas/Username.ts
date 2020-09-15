import Schema, { string, Type } from "computed-types";

const usernameRegex = /[A-Za-z0-9_]{3,20}/;

export const UsernameSchema = Schema(string.regexp(usernameRegex));
export type Username = Type<typeof UsernameSchema>;
export const validateUsername = UsernameSchema.destruct();
