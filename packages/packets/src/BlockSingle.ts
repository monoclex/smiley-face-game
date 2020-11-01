import Schema, { SchemaInput } from "computed-types";
import { BlockPositionSchema } from "@smiley-face-game/schemas/BlockPosition";
import { TileLayerSchema } from "@smiley-face-game/schemas/TileLayer";
import { BlockSchema } from "@smiley-face-game/schemas/Block";

export const BLOCK_SINGLE_ID = "BLOCK_SINGLE";

export type BlockSingleSchema = ReturnType<typeof blockSingle>["BlockSingleSchema"];
export type BlockSinglePacket = SchemaInput<BlockSingleSchema>;

export function blockSingle(blockPositionSchema: BlockPositionSchema) {
  const BlockSingleSchema = Schema({
    packetId: BLOCK_SINGLE_ID as typeof BLOCK_SINGLE_ID,
    position: blockPositionSchema,
    layer: TileLayerSchema,
    block: BlockSchema,
  });

  const validateBlockSingle = BlockSingleSchema.destruct();

  return { BlockSingleSchema, validateBlockSingle };
}
