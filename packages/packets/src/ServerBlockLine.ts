import Schema, { SchemaInput } from "computed-types";
import { BoundlessBlockPositionSchema } from "@smiley-face-game/schemas/BlockPosition";
import { TileLayerSchema } from "@smiley-face-game/schemas/TileLayer";
import { ServerSchema } from "./Server";
import { BlockSchema } from "@smiley-face-game/schemas/Block";

export const SERVER_BLOCK_LINE_ID = "SERVER_BLOCK_LINE";
export const ServerBlockLineSchema = Schema.merge(
  {
    packetId: SERVER_BLOCK_LINE_ID as typeof SERVER_BLOCK_LINE_ID,
    start: BoundlessBlockPositionSchema,
    end: BoundlessBlockPositionSchema,
    layer: TileLayerSchema,
    block: BlockSchema,
  },
  ServerSchema
);
export type ServerBlockLinePacket = SchemaInput<typeof ServerBlockLineSchema>;
export const validateServerBlockLine = ServerBlockLineSchema.destruct();
