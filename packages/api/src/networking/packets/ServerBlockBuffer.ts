import Schema, { array, Type } from "computed-types";
import { ServerBlockLineSchema } from "./ServerBlockLine";
import { ServerBlockSingleSchema } from './ServerBlockSingle';

// this schema doesn't merge the ServerSchema because each BlockSingle or BlockLine packet does that for us
// the reason we don't have the sender in the block buffer packet is so we can glob up all total packets
export const SERVER_BLOCK_BUFFER_ID = 'SERVER_BLOCK_BUFFER';
export const ServerBlockBufferSchema = Schema({
  packetId: SERVER_BLOCK_BUFFER_ID,
  blocks: array.of(Schema.either(ServerBlockSingleSchema, ServerBlockLineSchema))
});
export type ServerBlockBufferPacket = Type<typeof ServerBlockBufferSchema>;
export const validateServerBlockBuffer = ServerBlockBufferSchema.destruct();
