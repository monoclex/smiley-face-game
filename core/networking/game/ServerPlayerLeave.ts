import { Schema, Type } from "../../../deps.ts";
import { UserIdSchema } from "../../models/UserId.ts";

export const SERVER_PLAYER_LEAVE_ID = 'SERVER_PLAYER_LEAVE';
export const ServerPlayerLeaveSchema = Schema({
  packetId: SERVER_PLAYER_LEAVE_ID,
  userId: UserIdSchema,
});
export type ServerPlayerLeavePacket = Type<typeof ServerPlayerLeaveSchema>;
export const validateServerPlayerLeave = ServerPlayerLeaveSchema.destruct();
