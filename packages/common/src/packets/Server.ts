import Schema, { Type } from "computed-types";
import { UserIdSchema } from "../schemas/UserId";

export const ServerSchema = Schema({
  playerId: UserIdSchema,
});
export type ServerPacket = Type<typeof ServerSchema>;
