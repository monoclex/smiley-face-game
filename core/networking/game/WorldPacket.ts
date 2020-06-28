import { Schema, Type } from "./../../../deps.ts";
import { BlockSingleSchema } from "./BlockSingle.ts";
import { MovementSchema } from "./Movement.ts";
import { ServerBlockSingleSchema } from "./ServerBlockSingle.ts";
import { ServerInitSchema } from "./ServerInit.ts";
import { ServerMovementSchema } from "./ServerMovement.ts";
import { ServerPlayerJoinSchema } from "./ServerPlayerJoin.ts";
import { ServerPlayerLeaveSchema } from "./ServerPlayerLeave.ts";

export const WorldPacketSchema = Schema.either(
  BlockSingleSchema, ServerBlockSingleSchema,
  MovementSchema, ServerMovementSchema,
  ServerPlayerJoinSchema, ServerPlayerLeaveSchema, ServerInitSchema,
);
export type WorldPacket = Type<typeof WorldPacketSchema>;
export const validateWorldPacket = WorldPacketSchema.destruct();

/**
 * A type which maps every possible key of Packet to a function that accepts the packet whose packetId matches the lookup key.
 */
export type WorldPacketLookup<TArgs, TResult> = { [K in WorldPacket['packetId']]: (packet: WorldPacket & { packetId: K }, args: TArgs) => TResult };
export function invokeWorldPacketLookup<TArgs, TResult>(packetLookup: WorldPacketLookup<TArgs, TResult>, packet: WorldPacket, args: TArgs): TResult {
  //@ts-ignore
  return packetLookup[packet.packetId](packet, args);
}
