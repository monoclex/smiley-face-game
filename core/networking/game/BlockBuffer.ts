import { array, Schema, Type } from "../../../deps.ts";
import { BlockLineSchema } from "./BlockLine.ts";
import { BlockSingleSchema } from './BlockSingle.ts';

export const BLOCK_BUFFER_ID = 'BLOCK_BUFFER';
export const BlockBufferSchema = Schema({
  packetId: BLOCK_BUFFER_ID,
  blocks: array.of(Schema.either(BlockSingleSchema, BlockLineSchema))
});
export type BlockBufferPacket = Type<typeof BlockBufferSchema>;
export const validateBlockBuffer = BlockBufferSchema.destruct();
