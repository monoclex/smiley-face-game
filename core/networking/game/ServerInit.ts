import { array, Schema, Type } from "../../../deps.ts";
import { BlockSchema } from "../../models/Block.ts";
import { PlayerPositionSchema } from '../../models/PlayerPosition.ts';
import { SizeSchema } from "../../models/Size.ts";
import { ServerSchema } from './Server.ts';

export const SERVER_INIT_ID = 'SERVER_INIT';
export const ServerInitSchema = Schema.merge({
  packetId: SERVER_INIT_ID,
  size: SizeSchema,
  spawnPosition: PlayerPositionSchema,
  blocks: array.of(array.of(array.of(BlockSchema))),
}, ServerSchema);
export type ServerInitPacket = Type<typeof ServerInitSchema>;
export const validateServerInit = ServerInitSchema.destruct();
