import Schema, { Type } from "computed-types";
import { UserIdSchema } from "./UserId";

export const PlayerlistActionKindSchema = Schema.either({
  action: "give edit" as const,
  playerId: UserIdSchema
}, {
  action: "remove edit" as const,
  playerId: UserIdSchema
}, {
  action: "kick" as const,
  playerId: UserIdSchema
});
export type PlayerlistActionKind = Type<typeof PlayerlistActionKindSchema>;
export const validatePlayerlistActionKind = PlayerlistActionKindSchema.destruct();
