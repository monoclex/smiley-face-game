import Schema, { Type } from "computed-types";
import { ServerSchema } from "./Server";

export const SERVER_PLAYER_LEAVE_ID = 'SERVER_PLAYER_LEAVE';
export const ServerPlayerLeaveSchema = Schema.merge({
  packetId: SERVER_PLAYER_LEAVE_ID as typeof SERVER_PLAYER_LEAVE_ID,
}, ServerSchema);
export type ServerPlayerLeavePacket = Type<typeof ServerPlayerLeaveSchema>;
export const validateServerPlayerLeave = ServerPlayerLeaveSchema.destruct();
