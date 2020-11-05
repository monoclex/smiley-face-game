import * as z from "zod";
import { zInputs, zPlayerPosition, zVelocity, zBlockPosition, zTileLayer, zBlock, zPlayerListActionKind, zWorldActionKind, zBoundlessBlockPosition, zUserId, zWorldActionKindReply, zRole, zUsername, zWorldId, zSize, zWorldBlocks, zAngle, zMessage } from "./misc-zs";

// TODO: server packets don't need to have `SERVER_X` in their packetId, that might make some things simpler if considered

/**
 * Constructs a `zod` validator that will validate any packet that a client would send. When developers are adding new
 * client packets, they are expected to add them to this union. At that point, typescript type checking will take over
 * to ensure that any new packets are properly handled in all places.
 * @param width The width of the world.
 * @param height The height of the world.
 */
export const zPacket = (width: number, height: number) => {
  const blockPosition = zBlockPosition(width, height);
  const blockSingle = zBlockSingle(blockPosition);

  return z.union([
    zPickupGun, zMovement, zFireBullet, zEquipGun, zChat, zWorldAction, zPlayerListAction, blockSingle, zBlockLine,
  ]);
};

export type ZPacket = z.infer<ReturnType<typeof zPacket>>;
export type ZPacketId = Pick<ZPacket, "packetId">;

/**
 * Constructs a `zod` validator that will validate any packet that a server would send. When developers are adding new
 * server packets, they are expected to add them to this union. At that point, typescript type checking will take over
 * to ensure that any new packets are properly handled in all places.
 * @param width The width of the world.
 * @param height The height of the world.
 */
export const zsPacket = (width: number, height: number) => {
  const blockPosition = zBlockPosition(width, height);
  const blockSingle = zBlockSingle(blockPosition);
  const sBlockSingle = zsBlockSingle(blockSingle);

  return z.union([
    zsChat, zsEquipGun, zsFireBullet, zsInit, zsMovement, zsPickupGun, zsPlayerJoin, zsPlayerLeave, zsRoleUpdate,
    zsWorldAction, zsBlockLine, sBlockSingle,
  ])
};

export type ZSPacket = z.infer<ReturnType<typeof zsPacket>>;
export type ZSPacketId = Pick<ZSPacket, "packetId">;

export const zPickupGun = z.object({
  packetId: z.literal("PICKUP_GUN"),
  position: zPlayerPosition,
});

export const zMovement = z.object({
  packetId: z.literal("MOVEMENT"),
  position: zPlayerPosition,
  velocity: zVelocity,
  inputs: zInputs,
});

export const zFireBullet = z.object({
  packetId: z.literal("FIRE_BULLET"),
  angle: zAngle,
});

export const zEquipGun = z.object({
  packetId: z.literal("EQUIP_GUN"),
  equipped: z.boolean(),
});

export const zChat = z.object({
  packetId: z.literal("CHAT"),
  message: zMessage,
});

export const zWorldAction = z.object({
  packetId: z.literal("WORLD_ACTION"),
  action: zWorldActionKind,
});

export const zPlayerListAction = z.object({
  packetId: z.literal("PLAYER_LIST_ACTION"),
  action: zPlayerListActionKind,
});

export const zBlockSingle = (blockPosition: ReturnType<typeof zBlockPosition>) => z.object({
  packetId: z.literal("BLOCK_SINGLE"),
  position: blockPosition,
  layer: zTileLayer,
  block: zBlock,
});

export const zBlockLine = z.object({
  packetId: z.literal("BLOCK_LINE"),
  start: zBoundlessBlockPosition,
  end: zBoundlessBlockPosition,
  layer: zTileLayer,
  block: zBlock
});

/** Z Server packets (they're so frequent it's worth it to abbreviate) */
export const zs = z.object({
  playerId: zUserId
});

export const zsBlockLine = zs.merge(zBlockLine).extend({ packetId: z.literal("SERVER_BLOCK_LINE") });

export const zsWorldAction = zs.merge(z.object({
  packetId: z.literal("SERVER_WORLD_ACTION"),
  action: zWorldActionKindReply,
}));

export const zsBlockSingle = (blockSingle: ReturnType<typeof zBlockSingle>) => zs.merge(blockSingle).extend({
  packetId: z.literal("SERVER_BLOCK_SINGLE")
});

export const zsRoleUpdate = zs.merge(z.object({
  packetId: z.literal("SERVER_ROLE_UPDATE"),
  newRole: zRole,
}));

export const zsPlayerLeave = zs.merge(z.object({
  packetId: z.literal("SERVER_PLAYER_LEAVE"),
}));

export const zsPlayerJoin = zs.merge(z.object({
  packetId: z.literal("SERVER_PLAYER_JOIN"),
  username: zUsername,
  role: zRole,
  isGuest: z.boolean(),
  joinLocation: zPlayerPosition,
  hasGun: z.boolean(),
  gunEquipped: z.boolean(),
}));

export const zsPickupGun = zs.merge(z.object({
  packetId: z.literal("SERVER_PICKUP_GUN"),
}));

export const zsMovement = zs.merge(zMovement).extend({ packetId: z.literal("SERVER_MOVEMENT") });

export const zsInit = zs.merge(z.object({
  packetId: z.literal("SERVER_INIT"),
  role: zRole,
  worldId: zWorldId,
  size: zSize,
  spawnPosition: zPlayerPosition,
  blocks: zWorldBlocks,
  username: zUsername,
  isGuest: z.boolean(),
}));

export const zsFireBullet = zs.merge(zFireBullet).extend({ packetId: z.literal("SERVER_FIRE_BULLET") });
export const zsEquipGun = zs.merge(zEquipGun).extend({ packetId: z.literal("SERVER_EQUIP_GUN") });
export const zsChat = zs.merge(zChat).extend({ packetId: z.literal("SERVER_CHAT") });
