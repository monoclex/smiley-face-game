import { Schema, Type } from "../../../deps.ts";
import { BoundlessBlockPositionSchema } from "../../models/BlockPosition.ts";
import { TileIdSchema } from "../../models/TileId.ts";
import { TileLayerSchema } from "../../models/TileLayer.ts";

export const BLOCK_LINE_ID = 'BLOCK_LINE';
export const BlockLineSchema = Schema({
  packetId: BLOCK_LINE_ID,
  start: BoundlessBlockPositionSchema,
  end: BoundlessBlockPositionSchema,
  layer: TileLayerSchema,
  id: TileIdSchema,
});
export type BlockLinePacket = Type<typeof BlockLineSchema>;
export const validateBlockLine = BlockLineSchema.destruct();
