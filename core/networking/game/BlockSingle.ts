import { Schema, Type } from "../../../deps.ts";
import { BlockPositionSchema } from "../../models/BlockPosition.ts";
import { TileIdSchema } from "../../models/TileId.ts";
import { TileLayerSchema } from "../../models/TileLayer.ts";

export const BLOCK_SINGLE_ID = 'BLOCK_SINGLE';
export const BlockSingleSchema = Schema({
  packetId: BLOCK_SINGLE_ID,
  position: BlockPositionSchema,
  layer: TileLayerSchema,
  id: TileIdSchema,
});
export type BlockSinglePacket = Type<typeof BlockSingleSchema>;
export const validateBlockSingle = BlockSingleSchema.destruct();
