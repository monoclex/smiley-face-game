import Schema, { Type } from "computed-types";
import { BoundlessBlockPositionSchema } from "../schemas/BlockPosition";
import { TileIdSchema } from "../schemas/TileId";
import { TileLayerSchema } from "../schemas/TileLayer";
import { BlockSchema } from "../schemas/Block";

export const BLOCK_LINE_ID = "BLOCK_LINE";
export const BlockLineSchema = Schema.merge(
  {
    packetId: BLOCK_LINE_ID as typeof BLOCK_LINE_ID,
    start: BoundlessBlockPositionSchema,
    end: BoundlessBlockPositionSchema,
    layer: TileLayerSchema,
  },
  BlockSchema
);
export type BlockLinePacket = Type<typeof BlockLineSchema>;
export const validateBlockLine = BlockLineSchema.destruct();
