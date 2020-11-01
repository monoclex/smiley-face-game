import Schema, { SchemaInput } from "computed-types";
import { BoundlessBlockPositionSchema } from "@smiley-face-game/schemas/BlockPosition";
import { TileLayerSchema } from "@smiley-face-game/schemas/TileLayer";
import { BlockSchema } from "@smiley-face-game/schemas/Block";

export const BLOCK_LINE_ID = "BLOCK_LINE";
export const BlockLineSchema = Schema({
  packetId: BLOCK_LINE_ID as typeof BLOCK_LINE_ID,
  start: BoundlessBlockPositionSchema,
  end: BoundlessBlockPositionSchema,
  layer: TileLayerSchema,
  block: BlockSchema,
});
export type BlockLinePacket = SchemaInput<typeof BlockLineSchema>;
export const validateBlockLine = BlockLineSchema.destruct();
