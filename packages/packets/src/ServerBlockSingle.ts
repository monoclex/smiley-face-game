import Schema, { SchemaInput } from "computed-types";
import { BlockPositionSchema } from "@smiley-face-game/schemas/BlockPosition";
import { TileLayerSchema } from "@smiley-face-game/schemas/TileLayer";
import { ServerSchema } from "./Server";
import { BlockSchema } from "@smiley-face-game/schemas/Block";

export const SERVER_BLOCK_SINGLE_ID = "SERVER_BLOCK_SINGLE";

export type ServerBlockSingleSchema = ReturnType<typeof serverBlockSingle>["ServerBlockSingleSchema"];
export type ServerBlockSingleValidator = ReturnType<typeof serverBlockSingle>["validateServerBlockSingle"];
export type ServerBlockSinglePacket = SchemaInput<ServerBlockSingleSchema>;

export function serverBlockSingle(blockPositionSchema: BlockPositionSchema) {
  const ServerBlockSingleSchema = Schema.merge(
    {
      // TODO: figure out how to change packetId without remaking entire schema
      packetId: SERVER_BLOCK_SINGLE_ID as typeof SERVER_BLOCK_SINGLE_ID,
      position: blockPositionSchema,
      layer: TileLayerSchema,
      block: BlockSchema,
    },
    ServerSchema
  );

  const validateServerBlockSingle = ServerBlockSingleSchema.destruct();

  return { ServerBlockSingleSchema, validateServerBlockSingle };
}
