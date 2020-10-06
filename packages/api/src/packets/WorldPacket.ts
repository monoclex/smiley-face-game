import Schema, { Type } from "computed-types";
import { BlockPositionSchema } from "../schemas/BlockPosition";
import { BlockBufferSchema, blockBuffer } from "./BlockBuffer";
import { BlockLineSchema } from "./BlockLine";
import { blockSingle } from "./BlockSingle";
import { EquipGunSchema } from "./EquipGun";
import { FireBulletSchema } from "./FireBullet";
import { MovementSchema } from "./Movement";
import { PickupGunSchema } from "./PickupGun";
import {
  ServerBlockBufferSchema,
  serverBlockBuffer,
} from "./ServerBlockBuffer";
import { ServerBlockLineSchema } from "./ServerBlockLine";
import { serverBlockSingle } from "./ServerBlockSingle";
import { ServerEquipGunSchema } from "./ServerEquipGun";
import { ServerFireBulletSchema } from "./ServerFireBullet";
import { ServerInitSchema, ServerInitPacket } from "./ServerInit";
import { ServerMovementSchema } from "./ServerMovement";
import { ServerPickupGunSchema } from "./ServerPickupGun";
import { ServerPlayerJoinSchema } from "./ServerPlayerJoin";
import { ServerPlayerLeaveSchema } from "./ServerPlayerLeave";
import { ChatSchema } from "./Chat";
import { ServerChatSchema } from "./ServerChat";
import { PlayerlistActionSchema } from "@smiley-face-game/api/packets/PlayerlistAction";
import { ServerRoleUpdateSchema } from "./ServerRoleUpdate";

export type WorldPacketSchema = ReturnType<
  typeof worldPacket
>["WorldPacketSchema"];
export type WorldPacketValidator = ReturnType<
  typeof worldPacket
>["validateWorldPacket"];
export type WorldPacket = Exclude<Type<WorldPacketSchema>, { packetId: "SERVER_INIT" }> | ServerInitPacket;

export function worldPacket(blockPositionSchema: BlockPositionSchema) {
  const BlockSingleSchema = blockSingle(blockPositionSchema).BlockSingleSchema;
  const BlockBufferSchema = blockBuffer(BlockSingleSchema).BlockBufferSchema;
  const ServerBlockSingleSchema = serverBlockSingle(blockPositionSchema)
    .ServerBlockSingleSchema;
  const ServerBlockBufferSchema = serverBlockBuffer(ServerBlockSingleSchema)
    .ServerBlockBufferSchema;

  const WorldPacketSchema = Schema.either(
    Schema.either(
      ServerInitSchema,
      MovementSchema,
      ServerMovementSchema,
      ServerPlayerJoinSchema,
      ServerPlayerLeaveSchema
    ),

    // for the sake of type arguments, we have to split up packets into groups of 8 since Schema.either only accepts max 8 generic params
    Schema.either(
      PickupGunSchema,
      ServerPickupGunSchema,
      FireBulletSchema,
      ServerFireBulletSchema,
      EquipGunSchema,
      ServerEquipGunSchema,
      PlayerlistActionSchema,
      ServerRoleUpdateSchema
    ),

    Schema.either(
      BlockSingleSchema,
      ServerBlockSingleSchema,
      BlockLineSchema,
      ServerBlockLineSchema,
      BlockBufferSchema,
      ServerBlockBufferSchema,
      ChatSchema,
      ServerChatSchema
    )
  );

  const validateWorldPacket = WorldPacketSchema.destruct();

  return { WorldPacketSchema, validateWorldPacket };
}

// thanks @nw#3386 on the Typescript Community Discord (https://discord.gg/typescript) for this!
// convo: #help-willow https://discordapp.com/channels/508357248330760243/740274615770677319/744126507177345055
type PickWorldPacket<K extends WorldPacket["packetId"]> = Extract<
  WorldPacket,
  { packetId: K }
>;

/**
 * A type which maps every possible key of Packet to a function that accepts the packet whose packetId matches the lookup key.
 */
export type WorldPacketLookup<TArgs, TResult> = {
  [K in WorldPacket["packetId"]]: (
    packet: PickWorldPacket<K>,
    args: TArgs
  ) => TResult;
};
export function invokeWorldPacketLookup<TArgs, TResult>(
  packetLookup: WorldPacketLookup<TArgs, TResult>,
  packet: WorldPacket,
  args: TArgs
): TResult {
  //@ts-ignore
  return packetLookup[packet.packetId](packet, args);
}
