import Schema, { string, Type } from "computed-types";

// https://stackoverflow.com/a/24573236
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const AccountIdSchema = Schema(string.regexp(guidRegex));
export type AccountId = Type<typeof AccountIdSchema>;
export const validateAccountId = AccountIdSchema.destruct();
