import Schema, { Type } from "computed-types";
import { BlockPositionSchema } from "../schemas/BlockPosition";
import { TileIdSchema } from "../schemas/TileId";
import { TileLayerSchema } from "../schemas/TileLayer";
import { BlockSchema } from "../schemas/Block";

export const BLOCK_SINGLE_ID = "BLOCK_SINGLE";

export type BlockSingleSchema = ReturnType<
  typeof blockSingle
>["BlockSingleSchema"];
export type BlockSinglePacket = Type<BlockSingleSchema>;

export function blockSingle(blockPositionSchema: BlockPositionSchema) {
  const BlockSingleSchema = Schema.merge(
    {
      packetId: BLOCK_SINGLE_ID as typeof BLOCK_SINGLE_ID,
      position: blockPositionSchema,
      layer: TileLayerSchema,
    },
    BlockSchema
  );

  const validateBlockSingle = BlockSingleSchema.destruct();

  return { BlockSingleSchema, validateBlockSingle };
}
