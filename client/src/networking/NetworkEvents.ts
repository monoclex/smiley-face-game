import { ServerBlockBufferPacket } from '../libcore/core/networking/game/ServerBlockBuffer';
import { ServerBlockLinePacket } from '../libcore/core/networking/game/ServerBlockLine';
import { ServerBlockSinglePacket } from '../libcore/core/networking/game/ServerBlockSingle';
import { ServerEquipGunPacket } from '../libcore/core/networking/game/ServerEquipGun';
import { ServerFireBulletPacket } from '../libcore/core/networking/game/ServerFireBullet';
import { ServerInitPacket } from '../libcore/core/networking/game/ServerInit';
import { ServerMovementPacket } from '../libcore/core/networking/game/ServerMovement';
import { ServerPickupGunPacket } from '../libcore/core/networking/game/ServerPickupGun';
import { ServerPlayerJoinPacket } from '../libcore/core/networking/game/ServerPlayerJoin';
import { ServerPlayerLeavePacket } from '../libcore/core/networking/game/ServerPlayerLeave';
import { NetworkClient } from './NetworkClient';

export type NetworkEventHandler<TEvent> = (event: TEvent, sender: NetworkClient) => void | Promise<void>;

export class NetworkEvents {
  onBlockSingle?: NetworkEventHandler<ServerBlockSinglePacket>;
  onMovement?: NetworkEventHandler<ServerMovementPacket>;
  onPlayerJoin?: NetworkEventHandler<ServerPlayerJoinPacket>;
  onPlayerLeave?: NetworkEventHandler<ServerPlayerLeavePacket>;
  onInit?: NetworkEventHandler<ServerInitPacket>;
  onPickupGun?: NetworkEventHandler<ServerPickupGunPacket>;
  onFireBullet?: NetworkEventHandler<ServerFireBulletPacket>;
  onEquipGun?: NetworkEventHandler<ServerEquipGunPacket>;
  onBlockLine?: NetworkEventHandler<ServerBlockLinePacket>;
  onBlockBuffer?: NetworkEventHandler<ServerBlockBufferPacket>;
}
