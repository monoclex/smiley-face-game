import Schema, { array, boolean, Type } from "computed-types";
import { BlockSchema } from "../../models/Block";
import { PlayerPositionSchema } from '../../models/PlayerPosition';
import { SizeSchema } from "../../models/Size";
import { UserIdSchema } from '../../models/UserId';
import { UsernameSchema } from '../../models/Username';
import { ServerSchema } from './Server';

export const SERVER_INIT_ID = 'SERVER_INIT';
export const ServerInitSchema = Schema.merge({
  packetId: SERVER_INIT_ID,
  size: SizeSchema,
  spawnPosition: PlayerPositionSchema,
  blocks: array.of(array.of(array.of(BlockSchema))),
  self: Schema({
    username: UsernameSchema,
    isGuest: boolean,
    userId: UserIdSchema
  })
}, ServerSchema);
export type ServerInitPacket = Type<typeof ServerInitSchema>;
export const validateServerInit = ServerInitSchema.destruct();
