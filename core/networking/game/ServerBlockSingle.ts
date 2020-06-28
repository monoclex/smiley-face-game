import { Schema, Type } from "../../../deps.ts";
import { BlockPositionSchema } from "../../models/BlockPosition.ts";
import { TileIdSchema } from "../../models/TileId.ts";
import { TileLayerSchema } from "../../models/TileLayer.ts";
import { ServerSchema } from "./Server.ts";

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
