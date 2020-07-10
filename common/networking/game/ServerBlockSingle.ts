import Schema, { Type } from "computed-types";
import { BlockPositionSchema } from "../../models/BlockPosition";
import { TileIdSchema } from "../../models/TileId";
import { TileLayerSchema } from "../../models/TileLayer";
import { ServerSchema } from "./Server";

export const SERVER_BLOCK_SINGLE_ID = 'SERVER_BLOCK_SINGLE';
export const ServerBlockSingleSchema = Schema.merge({
  // TODO: figure out how to change packetId without remaking entire schema
  packetId: SERVER_BLOCK_SINGLE_ID,
  position: BlockPositionSchema,
  layer: TileLayerSchema,
  id: TileIdSchema,
}, ServerSchema);
export type ServerBlockSinglePacket = Type<typeof ServerBlockSingleSchema>;
export const validateServerBlockSingle = ServerBlockSingleSchema.destruct();
