import { Schema, Type } from "../../../deps.ts";
import { BlockPositionSchema } from "../../models/BlockPosition.ts";
import { TileIdSchema } from "../../models/TileId.ts";
import { TileLayerSchema } from "../../models/TileLayer.ts";
import { ServerSchema } from './Server.ts';

export const SERVER_BLOCK_LINE_ID = 'SERVER_BLOCK_LINE';
export const ServerBlockLineSchema = Schema.merge({
  packetId: SERVER_BLOCK_LINE_ID,
  start: BlockPositionSchema,
  end: BlockPositionSchema,
  layer: TileLayerSchema,
  id: TileIdSchema,
}, ServerSchema);
export type ServerBlockLinePacket = Type<typeof ServerBlockLineSchema>;
export const validateServerBlockLine = ServerBlockLineSchema.destruct();
