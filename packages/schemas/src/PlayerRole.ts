import Schema, { Type } from "computed-types";

export const PlayerRoleSchema = Schema.either("non" as const, "edit" as const, "owner" as const, "staff" as const);
export type PlayerRole = Type<typeof PlayerRoleSchema>;
export const validatePlayerRole = PlayerRoleSchema.destruct();
