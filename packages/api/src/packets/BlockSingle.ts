import Schema, { Type } from "computed-types";
import { BlockPositionSchema } from "../../schemas/BlockPosition";
import { TileIdSchema } from "../../schemas/TileId";
import { TileLayerSchema } from "../../schemas/TileLayer";

export const BLOCK_SINGLE_ID = 'BLOCK_SINGLE';
export const BlockSingleSchema = Schema({
  packetId: BLOCK_SINGLE_ID as typeof BLOCK_SINGLE_ID,
  position: BlockPositionSchema,
  layer: TileLayerSchema,
  id: TileIdSchema,
});
export type BlockSinglePacket = Type<typeof BlockSingleSchema>;
export const validateBlockSingle = BlockSingleSchema.destruct();
