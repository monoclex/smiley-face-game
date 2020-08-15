import Schema, { string, Type } from "computed-types";

// max 64: that's the maximum input a sha256 hash will accept before it goes over.
// at least, i think - check here https://crypto.stackexchange.com/a/54854

export const PasswordSchema = Schema(string.min(1).max(64));
export type Password = Type<typeof PasswordSchema>;
export const validatePassword = PasswordSchema.destruct();
