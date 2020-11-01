import Schema, { string, Type } from "computed-types";

const usernameRegex = /[A-Za-z0-9_]/;

// .min(3).max(20) is being used because despite adding {3,20} to the regex, it seemed to not limit the username length
export const UsernameSchema = Schema(string.regexp(usernameRegex).min(3).max(20));
export type Username = Type<typeof UsernameSchema>;
export const validateUsername = UsernameSchema.destruct();
