import Schema, { Type } from "computed-types";
import { BlockPositionSchema } from "../schemas/BlockPosition";
import { TileIdSchema } from "../schemas/TileId";
import { TileLayerSchema } from "../schemas/TileLayer";
import { ServerSchema } from "./Server";

export const SERVER_BLOCK_SINGLE_ID = 'SERVER_BLOCK_SINGLE';

export type ServerBlockSingleSchema = ReturnType<typeof serverBlockSingle>["ServerBlockSingleSchema"];
export type ServerBlockSinglePacket = Type<ServerBlockSingleSchema>;

export function serverBlockSingle(blockPositionSchema: BlockPositionSchema) {
  const ServerBlockSingleSchema = Schema.merge({
    // TODO: figure out how to change packetId without remaking entire schema
    packetId: SERVER_BLOCK_SINGLE_ID as typeof SERVER_BLOCK_SINGLE_ID,
    position: blockPositionSchema,
    layer: TileLayerSchema,
    id: TileIdSchema,
  }, ServerSchema);

  const validateServerBlockSingle = ServerBlockSingleSchema.destruct();

  return { ServerBlockSingleSchema, validateServerBlockSingle };
}
