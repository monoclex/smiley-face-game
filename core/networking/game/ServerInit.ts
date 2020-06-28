import { array, Schema, Type } from "../../../deps.ts";
import { SizeSchema } from "../../models/Size.ts";
import { TileIdSchema } from "../../models/TileId.ts";

export const SERVER_INIT_ID = 'SERVER_INIT';
export const ServerInitSchema = Schema({
  packetId: SERVER_INIT_ID,
  size: SizeSchema,
  blocks: array.of(array.of(array.of(TileIdSchema))),
});
export type ServerInitPacket = Type<typeof ServerInitSchema>;
export const validateServerInit = ServerInitSchema.destruct();
