import Schema, { Type } from "computed-types";
import { BlockBufferSchema } from "./BlockBuffer";
import { BlockLineSchema } from "./BlockLine";
import { BlockSingleSchema } from "./BlockSingle";
import { EquipGunSchema } from "./EquipGun";
import { FireBulletSchema } from "./FireBullet";
import { MovementSchema } from "./Movement";
import { PickupGunSchema } from './PickupGun';
import { ServerBlockBufferSchema } from "./ServerBlockBuffer";
import { ServerBlockLineSchema } from "./ServerBlockLine";
import { ServerBlockSingleSchema } from "./ServerBlockSingle";
import { ServerEquipGunSchema } from "./ServerEquipGun";
import { ServerFireBulletSchema } from "./ServerFireBullet";
import { ServerInitSchema } from "./ServerInit";
import { ServerMovementSchema } from "./ServerMovement";
import { ServerPickupGunSchema } from "./ServerPickupGun";
import { ServerPlayerJoinSchema } from "./ServerPlayerJoin";
import { ServerPlayerLeaveSchema } from "./ServerPlayerLeave";

export const WorldPacketSchema = Schema.either(
  Schema.either(
    ServerInitSchema,
    MovementSchema, ServerMovementSchema,
    ServerPlayerJoinSchema, ServerPlayerLeaveSchema,
  ),

  // for the sake of type arguments, we have to split up packets into groups of 8 since Schema.either only accepts max 8 generic params
  Schema.either(
    PickupGunSchema, ServerPickupGunSchema,
    FireBulletSchema, ServerFireBulletSchema,
    EquipGunSchema, ServerEquipGunSchema,
  ),

  Schema.either(
    BlockSingleSchema, ServerBlockSingleSchema,
    BlockLineSchema, ServerBlockLineSchema,
    BlockBufferSchema, ServerBlockBufferSchema,
  )
);
export type WorldPacket = Type<typeof WorldPacketSchema>;
export const validateWorldPacket = WorldPacketSchema.destruct();

// thanks @nw#3386 on the Typescript Community Discord (https://discord.gg/typescript) for this!
// convo: #help-willow https://discordapp.com/channels/508357248330760243/740274615770677319/744126507177345055
type PickWorldPacket<K extends WorldPacket["packetId"]> = Extract<WorldPacket, { packetId: K }>;

/**
 * A type which maps every possible key of Packet to a function that accepts the packet whose packetId matches the lookup key.
 */
export type WorldPacketLookup<TArgs, TResult> = { [K in WorldPacket['packetId']]: (packet: PickWorldPacket<K>, args: TArgs) => TResult };
export function invokeWorldPacketLookup<TArgs, TResult>(packetLookup: WorldPacketLookup<TArgs, TResult>, packet: WorldPacket, args: TArgs): TResult {
  //@ts-ignore
  return packetLookup[packet.packetId](packet, args);
}
