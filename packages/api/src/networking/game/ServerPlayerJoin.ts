import Schema, { boolean, Type } from "computed-types";
import { PlayerPositionSchema } from "../../models/PlayerPosition";
import { UserIdSchema } from "../../models/UserId";
import { UsernameSchema } from '../../models/Username';

export const SERVER_PLAYER_JOIN_ID = 'SERVER_PLAYER_JOIN';
export const ServerPlayerJoinSchema = Schema({
  packetId: SERVER_PLAYER_JOIN_ID,
  userId: UserIdSchema,
  username: UsernameSchema,
  isGuest: boolean,
  joinLocation: PlayerPositionSchema,
  hasGun: boolean,
  gunEquipped: boolean,
});
export type ServerPlayerJoinPacket = Type<typeof ServerPlayerJoinSchema>;
export const validateServerPlayerJoin = ServerPlayerJoinSchema.destruct();
