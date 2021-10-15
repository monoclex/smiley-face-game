import Schema, { SchemaInput, boolean, addParse, array, number } from "./computed-types-wrapper";
import {
  zInputs,
  zPlayerPosition,
  zVelocity,
  zBlockPosition,
  zTileLayer,
  zBlock,
  zPlayerListActionKind,
  zWorldActionKind,
  zBoundlessBlockPosition,
  zUserId,
  zWorldActionKindReply,
  zRole,
  zUsername,
  zWorldId,
  zSize,
  zWorldBlocks,
  zAngle,
  zMessage,
  zTileJsonFile,
} from "./types";

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

  return addParse(
    Schema.either(
      Schema.either(zPickupGun, zMovement, zFireBullet, zEquipGun, zChat, zWorldAction, zPlayerListAction, blockSingle),
      zBlockLine
    )
  );
};

export type ZPacket = SchemaInput<ReturnType<typeof zPacket>>;
export type ZPacketId = Pick<ZPacket, "packetId">;
export type ZPacketValidator = ReturnType<typeof zPacket>;

// thanks @nw#3386 on the Typescript Community Discord (https://discord.gg/typescript) for this!
// convo: #help-willow https://discordapp.com/channels/508357248330760243/740274615770677319/744126507177345055
type PickZPacket<K extends ZPacket["packetId"]> = Extract<ZPacket, { packetId: K }>;

/**
 * A type which maps every possible key of Packet to a function that accepts the packet whose packetId matches the lookup key.
 */
export type ZPacketLookup<TArgs, TResult> = {
  [K in ZPacket["packetId"]]: (packet: PickZPacket<K>, args: TArgs) => TResult;
};

/**
 * Constructs a `zod` validator that will validate any packet that a server would send. When developers are adding new
 * server packets, they are expected to add them to this union. At that point, typescript type checking will take over
 * to ensure that any new packets are properly handled in all places.
 * @param width The width of the world.
 * @param height The height of the world.
 */
export const zsPacket = (width: number, height: number) => {
  const blockPosition = zBlockPosition(width, height);
  const sBlockSingle = zsBlockSingle(blockPosition);

  return addParse(
    Schema.either(
      Schema.either(zsChat, zsEquipGun, zsFireBullet, zsInit, zsMovement, zsPickupGun, zsPlayerJoin, zsPlayerLeave),
      Schema.either(zsRoleUpdate, zsWorldAction, zsBlockLine, sBlockSingle, zsEvent)
    )
  );
};

export type ZSPacket = SchemaInput<ReturnType<typeof zsPacket>>;
export type ZSPacketId = Pick<ZSPacket, "packetId">;

// copied from above PickZPacket
export type PickZSPacket<K extends ZSPacket["packetId"]> = Extract<ZSPacket, { packetId: K }>;

export const zPickupGun = addParse(
  Schema({
    packetId: "PICKUP_GUN" as const,
    position: zPlayerPosition,
  })
);
export type ZPickupGun = SchemaInput<typeof zPickupGun>;

export const zMovement = addParse(
  Schema({
    packetId: "MOVEMENT" as const,
    position: zPlayerPosition,
    velocity: zVelocity,
    inputs: zInputs,
  })
);
export type ZMovement = SchemaInput<typeof zMovement>;

export const zFireBullet = addParse(
  Schema({
    packetId: "FIRE_BULLET" as const,
    angle: zAngle,
  })
);
export type ZFireBullet = SchemaInput<typeof zFireBullet>;

export const zEquipGun = addParse(
  Schema({
    packetId: "EQUIP_GUN" as const,
    equipped: boolean,
  })
);
export type ZEquipGun = SchemaInput<typeof zEquipGun>;

export const zChat = addParse(
  Schema({
    packetId: "CHAT" as const,
    message: zMessage,
  })
);
export type ZChat = SchemaInput<typeof zChat>;

export const zWorldAction = addParse(
  Schema({
    packetId: "WORLD_ACTION" as const,
    action: zWorldActionKind,
  })
);
export type ZWorldAction = SchemaInput<typeof zWorldAction>;

export const zPlayerListAction = addParse(
  Schema({
    packetId: "PLAYER_LIST_ACTION" as const,
    action: zPlayerListActionKind,
  })
);
export type ZPlayerListAction = SchemaInput<typeof zPlayerListAction>;

export const zBlockSingle = (blockPosition: ReturnType<typeof zBlockPosition>) =>
  Schema({
    packetId: "BLOCK_SINGLE" as const,
    position: blockPosition,
    layer: zTileLayer,
    block: zBlock,
  });
export type ZBlockSingle = SchemaInput<ReturnType<typeof zBlockSingle>>;

export const zBlockLine = addParse(
  Schema({
    packetId: "BLOCK_LINE" as const,
    start: zBoundlessBlockPosition,
    end: zBoundlessBlockPosition,
    layer: zTileLayer,
    block: zBlock,
  })
);
export type ZBlockLine = SchemaInput<typeof zBlockLine>;

/** Z Server packets (they're so frequent it's worth it to abbreviate) */
export const zs = addParse(
  Schema({
    playerId: zUserId,
  })
);

export const zsBlockLine = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_BLOCK_LINE" as const,
    start: zBoundlessBlockPosition,
    end: zBoundlessBlockPosition,
    layer: zTileLayer,
    block: zBlock,
  })
);
export type ZSBlockLine = SchemaInput<typeof zsBlockLine>;

export const zsWorldAction = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_WORLD_ACTION" as const,
    action: zWorldActionKindReply,
  })
);

export const zsBlockSingle = (blockPosition: ReturnType<typeof zBlockPosition>) =>
  Schema.merge(zs, {
    packetId: "SERVER_BLOCK_SINGLE" as const,
    position: blockPosition,
    layer: zTileLayer,
    block: zBlock,
  });
export type ZSBlockSingle = SchemaInput<ReturnType<typeof zsBlockSingle>>;

export const zsRoleUpdate = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_ROLE_UPDATE" as const,
    newRole: zRole,
  })
);

export const zsPlayerLeave = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_PLAYER_LEAVE" as const,
  })
);

export const zsPlayerJoin = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_PLAYER_JOIN" as const,
    username: zUsername,
    role: zRole,
    isGuest: boolean,
    joinLocation: zPlayerPosition,
    hasGun: boolean,
    gunEquipped: boolean,
  })
);
export type ZSPlayerJoin = SchemaInput<typeof zsPlayerJoin>;

export const zsPickupGun = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_PICKUP_GUN" as const,
  })
);

export const zsMovement = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_MOVEMENT" as const,
    position: zPlayerPosition,
    velocity: zVelocity,
    inputs: zInputs,
  })
);

export const zsInit = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_INIT" as const,
    role: zRole,
    worldId: zWorldId,
    size: zSize,
    spawnPosition: zPlayerPosition,
    blocks: zWorldBlocks,
    username: zUsername,
    isGuest: boolean,
    tiles: zTileJsonFile,
    players: array.of(zsPlayerJoin),
  })
);
export type ZSInit = SchemaInput<typeof zsInit>;

export const zsFireBullet = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_FIRE_BULLET" as const,
    angle: zAngle,
  })
);

export const zsEquipGun = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_EQUIP_GUN" as const,
    equipped: boolean,
  })
);

export const zsChat = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_CHAT" as const,
    message: zMessage,
  })
);

export const zsEvent = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_EVENT" as const,
    event: Schema.either({
      type: "chat rate limited" as const,
      duration: number.integer().gte(0),
    }),
  })
);
export type ZSEvent = SchemaInput<typeof zsEvent>;
