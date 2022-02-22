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
  zHeap,
  zHeaps,
} from "./types";

// TODO: server packets don't need to have `SERVER_X` in their packetId, that might make some things simpler if considered

export const zPickupGun = addParse(
  Schema({
    packetId: "PICKUP_GUN" as const,
    position: zPlayerPosition,
  })
);
export type ZPickupGun = SchemaInput<typeof zPickupGun>;

export const zMovementQueue = addParse(array.of(number).min(2).max(2));
export type ZMovementQueue = SchemaInput<typeof zMovementQueue>;

export const zMovement = addParse(
  Schema({
    packetId: "MOVEMENT" as const,
    position: zPlayerPosition,
    velocity: zVelocity,
    inputs: zInputs,

    // ee physics
    queue: zMovementQueue,
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
    layer: zTileLayer.optional(),
    block: zBlock,
    heap: zHeap.optional(),
  });
export type ZBlockSingle = SchemaInput<ReturnType<typeof zBlockSingle>>;

export const zBlockLine = addParse(
  Schema({
    packetId: "BLOCK_LINE" as const,
    start: zBoundlessBlockPosition,
    end: zBoundlessBlockPosition,
    layer: zTileLayer.optional(),
    block: zBlock,
    heap: zHeap.optional(),
  })
);
export type ZBlockLine = SchemaInput<typeof zBlockLine>;

export const zKeyTouch = addParse(
  Schema({
    packetId: "KEY_TOUCH" as const,
    kind: "red" as const,
  })
);
export type ZKeyTouch = SchemaInput<typeof zKeyTouch>;

export const zToggleGod = addParse(
  Schema({
    packetId: "TOGGLE_GOD" as const,
    god: boolean,
  })
);
export type ZToggleGod = SchemaInput<typeof zToggleGod>;

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
    layer: zTileLayer.optional(),
    block: zBlock,
    heap: zHeap.optional(),
  })
);
export type ZSBlockLine = SchemaInput<typeof zsBlockLine>;

export const zsWorldAction = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_WORLD_ACTION" as const,
    action: zWorldActionKindReply,
  })
);
export type ZSWorldAction = SchemaInput<typeof zsWorldAction>;

export const zsBlockSingle = (blockPosition: ReturnType<typeof zBlockPosition>) =>
  Schema.merge(zs, {
    packetId: "SERVER_BLOCK_SINGLE" as const,
    position: blockPosition,
    layer: zTileLayer.optional(),
    block: zBlock,
    heap: zHeap.optional(),
  });
export type ZSBlockSingle = SchemaInput<ReturnType<typeof zsBlockSingle>>;

export const zsRoleUpdate = addParse(
  Schema.merge(
    zs,
    Schema.either(
      // soon we will be permission based but for now,
      // i will maintain legacy role-based things
      {
        packetId: "SERVER_ROLE_UPDATE" as const,
        permission: "ROLE" as const,
        newRole: zRole,
      },
      {
        packetId: "SERVER_ROLE_UPDATE" as const,
        permission: "GOD" as const,
        canGod: boolean,
      }
    )
  )
);
export type ZSRoleUpdate = SchemaInput<typeof zsRoleUpdate>;

export const zsPlayerLeave = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_PLAYER_LEAVE" as const,
  })
);
export type ZSPlayerLeave = SchemaInput<typeof zsPlayerLeave>;

export const zsPlayerJoin = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_PLAYER_JOIN" as const,
    username: zUsername,
    role: zRole,
    isGuest: boolean,
    joinLocation: zPlayerPosition,
    hasGun: boolean,
    gunEquipped: boolean,
    canGod: boolean,
    inGod: boolean,
  })
);
export type ZSPlayerJoin = SchemaInput<typeof zsPlayerJoin>;

export const zsPickupGun = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_PICKUP_GUN" as const,
  })
);
export type ZSPickupGun = SchemaInput<typeof zsPickupGun>;

export const zsMovement = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_MOVEMENT" as const,
    position: zPlayerPosition,
    velocity: zVelocity,
    inputs: zInputs,

    // ee physics
    queue: zMovementQueue,
  })
);
export type ZSMovement = SchemaInput<typeof zsMovement>;

export const zsInit = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_INIT" as const,
    role: zRole,
    worldId: zWorldId,
    size: zSize,
    spawnPosition: zPlayerPosition,
    blocks: zWorldBlocks,
    heaps: zHeaps,
    username: zUsername,
    isGuest: boolean,
    canGod: boolean,
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
export type ZSFireBullet = SchemaInput<typeof zsFireBullet>;

export const zsEquipGun = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_EQUIP_GUN" as const,
    equipped: boolean,
  })
);
export type ZSEquipGun = SchemaInput<typeof zsEquipGun>;

export const zsChat = addParse(
  Schema.merge(zs, {
    packetId: "SERVER_CHAT" as const,
    message: zMessage,
  })
);
export type ZSChat = SchemaInput<typeof zsChat>;

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

export const zsKeyTouch = addParse(
  Schema({
    packetId: "SERVER_KEY_TOUCH" as const,
    playerId: zUserId,
    kind: "red" as const,
    // TODO: change to some kind of date?
    deactivateTime: number.integer(),
  })
);
export type ZSKeyTouch = SchemaInput<typeof zsKeyTouch>;

export const zsToggleGod = addParse(
  Schema({
    packetId: "SERVER_TOGGLE_GOD" as const,
    playerId: zUserId,
    god: boolean,
  })
);
export type ZSToggleGod = SchemaInput<typeof zsToggleGod>;

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
      Schema.either(
        zPickupGun,
        zMovement,
        zFireBullet,
        zEquipGun,
        zChat,
        zWorldAction,
        zPlayerListAction,
        blockSingle
      ),
      Schema.either(zBlockLine, zKeyTouch, zToggleGod)
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
      Schema.either(
        zsChat,
        zsEquipGun,
        zsFireBullet,
        zsInit,
        zsMovement,
        zsPickupGun,
        zsPlayerJoin,
        zsPlayerLeave
      ),
      Schema.either(
        zsRoleUpdate,
        zsWorldAction,
        zsBlockLine,
        sBlockSingle,
        zsEvent,
        zsKeyTouch,
        zsToggleGod
      )
    )
  );
};

export type ZSPacket = SchemaInput<ReturnType<typeof zsPacket>>;
export type ZSPacketId = Pick<ZSPacket, "packetId">;

// copied from above PickZPacket
export type PickZSPacket<K extends ZSPacket["packetId"]> = Extract<ZSPacket, { packetId: K }>;
