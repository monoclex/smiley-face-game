import Schema, { Type } from "computed-types";
import { BlockPositionSchema } from "../../models/BlockPosition";
import { TileIdSchema } from "../../models/TileId";
import { TileLayerSchema } from "../../models/TileLayer";

export const BLOCK_SINGLE_ID = 'BLOCK_SINGLE';
export const BlockSingleSchema = Schema({
  packetId: BLOCK_SINGLE_ID,
  position: BlockPositionSchema,
  layer: TileLayerSchema,
  id: TileIdSchema,
});
export type BlockSinglePacket = Type<typeof BlockSingleSchema>;
export const validateBlockSingle = BlockSingleSchema.destruct();
