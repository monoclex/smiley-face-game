import Schema, { array, Type } from "computed-types";
import { BlockLineSchema } from "./BlockLine";
import { BlockSingleSchema } from "./BlockSingle";

export const BLOCK_BUFFER_ID = "BLOCK_BUFFER";

export type BlockBufferSchema = ReturnType<
  typeof blockBuffer
>["BlockBufferSchema"];
export type BlockBufferPacket = Type<BlockBufferSchema>;

export function blockBuffer(blockSingleSchema: BlockSingleSchema) {
  const BlockBufferSchema = Schema({
    packetId: BLOCK_BUFFER_ID as typeof BLOCK_BUFFER_ID,
    blocks: array.of(Schema.either(blockSingleSchema, BlockLineSchema)),
  });

  const validateBlockBuffer = BlockBufferSchema.destruct();

  return { BlockBufferSchema, validateBlockBuffer };
}
