import Schema, { Type } from "computed-types";
import { BoundlessBlockPositionSchema } from '../schemas/BlockPosition';
import { TileIdSchema } from "../schemas/TileId";
import { TileLayerSchema } from "../schemas/TileLayer";
import { ServerSchema } from './Server';
import { BlockSchema } from "../schemas/Block";

export const SERVER_BLOCK_LINE_ID = 'SERVER_BLOCK_LINE';
export const ServerBlockLineSchema = Schema.merge({
  packetId: SERVER_BLOCK_LINE_ID as typeof SERVER_BLOCK_LINE_ID,
  start: BoundlessBlockPositionSchema,
  end: BoundlessBlockPositionSchema,
  layer: TileLayerSchema,
}, ServerSchema, BlockSchema);
export type ServerBlockLinePacket = Type<typeof ServerBlockLineSchema>;
export const validateServerBlockLine = ServerBlockLineSchema.destruct();
