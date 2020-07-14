import Schema, { Type } from "computed-types";
import { BoundlessBlockPositionSchema } from "../../models/BlockPosition";
import { TileIdSchema } from "../../models/TileId";
import { TileLayerSchema } from "../../models/TileLayer";

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
