import { boolean, Schema, Type } from "../../../deps.ts";
import { PlayerPositionSchema } from "../../models/PlayerPosition.ts";
import { UserIdSchema } from "../../models/UserId.ts";

export const SERVER_PLAYER_JOIN_ID = 'SERVER_PLAYER_JOIN';
export const ServerPlayerJoinSchema = Schema({
  packetId: SERVER_PLAYER_JOIN_ID,
  userId: UserIdSchema,
  joinLocation: PlayerPositionSchema,
  hasGun: boolean,
});
export type ServerPlayerJoinPacket = Type<typeof ServerPlayerJoinSchema>;
export const validateServerPlayerJoin = ServerPlayerJoinSchema.destruct();
