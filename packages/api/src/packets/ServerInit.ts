import Schema, { array, boolean, Type } from "computed-types";
import { BlockSchema } from "../../schemas/Block";
import { PlayerPositionSchema } from '../../schemas/PlayerPosition';
import { SizeSchema } from "../../schemas/Size";
import { UserIdSchema } from '../../schemas/UserId';
import { UsernameSchema } from '../../schemas/Username';
import { ServerSchema } from './Server';

export const SERVER_INIT_ID = 'SERVER_INIT';
export const ServerInitSchema = Schema.merge({
  packetId: SERVER_INIT_ID as typeof SERVER_INIT_ID,
  size: SizeSchema,
  spawnPosition: PlayerPositionSchema,
  blocks: array.of(array.of(array.of(BlockSchema))),
  self: Schema({
    username: UsernameSchema,
    isGuest: boolean,
    playerId: UserIdSchema
  })
}, ServerSchema);
export type ServerInitPacket = Type<typeof ServerInitSchema>;
export const validateServerInit = ServerInitSchema.destruct();
