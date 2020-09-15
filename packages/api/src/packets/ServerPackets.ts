import { ServerBlockBufferPacket, SERVER_BLOCK_BUFFER_ID } from "./ServerBlockBuffer";
import { ServerBlockLinePacket, SERVER_BLOCK_LINE_ID } from "./ServerBlockLine";
import { ServerBlockSinglePacket, SERVER_BLOCK_SINGLE_ID } from "./ServerBlockSingle";
import { ServerEquipGunPacket, SERVER_EQUIP_GUN_ID } from "./ServerEquipGun";
import { ServerFireBulletPacket, SERVER_FIRE_BULLET_ID } from "./ServerFireBullet";
import { ServerInitPacket, SERVER_INIT_ID } from "./ServerInit";
import { ServerMovementPacket, SERVER_MOVEMENT_ID } from "./ServerMovement";
import { ServerPickupGunPacket, SERVER_PICKUP_GUN_ID } from "./ServerPickupGun";
import { ServerPlayerJoinPacket, SERVER_PLAYER_JOIN_ID } from "./ServerPlayerJoin";
import { ServerPlayerLeavePacket, SERVER_PLAYER_LEAVE_ID } from "./ServerPlayerLeave";

export type ServerPackets =
  | ServerBlockBufferPacket
  | ServerBlockLinePacket
  | ServerBlockSinglePacket
  | ServerEquipGunPacket
  | ServerFireBulletPacket
  | ServerInitPacket
  | ServerMovementPacket
  | ServerPickupGunPacket
  | ServerPlayerJoinPacket
  | ServerPlayerLeavePacket
  ;

// TODO: dumb
const lookup = {
  [SERVER_BLOCK_BUFFER_ID]: true,
  [SERVER_BLOCK_LINE_ID]: true,
  [SERVER_BLOCK_SINGLE_ID]: true,
  [SERVER_EQUIP_GUN_ID]: true,
  [SERVER_FIRE_BULLET_ID]: true,
  [SERVER_INIT_ID]: true,
  [SERVER_MOVEMENT_ID]: true,
  [SERVER_PICKUP_GUN_ID]: true,
  [SERVER_PLAYER_JOIN_ID]: true,
  [SERVER_PLAYER_LEAVE_ID]: true,
}

export function isServerPacket(packet: any): packet is ServerPackets {
  if (!packet.packetId) return false;
  return lookup[packet.packetId] || false;
}
