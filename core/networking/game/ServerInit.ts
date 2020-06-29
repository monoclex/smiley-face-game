import { array, Schema, Type } from "../../../deps.ts";
import { BlockSchema } from "../../models/Block.ts";
import { PlayerPositionSchema } from '../../models/PlayerPosition.ts';
import { SizeSchema } from "../../models/Size.ts";

export const SERVER_INIT_ID = 'SERVER_INIT';
export const ServerInitSchema = Schema({
  packetId: SERVER_INIT_ID,
  size: SizeSchema,
  spawnPosition: PlayerPositionSchema,
  blocks: array.of(array.of(array.of(BlockSchema))),
});
export type ServerInitPacket = Type<typeof ServerInitSchema>;
export const validateServerInit = ServerInitSchema.destruct();
