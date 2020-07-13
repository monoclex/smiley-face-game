import { ServerBlockBufferPacket } from '../../common/networking/game/ServerBlockBuffer';
import { ServerBlockLinePacket } from '../../common/networking/game/ServerBlockLine';
import { ServerBlockSinglePacket } from '../../common/networking/game/ServerBlockSingle';
import { ServerEquipGunPacket } from '../../common/networking/game/ServerEquipGun';
import { ServerFireBulletPacket } from '../../common/networking/game/ServerFireBullet';
import { ServerInitPacket } from '../../common/networking/game/ServerInit';
import { ServerMovementPacket } from '../../common/networking/game/ServerMovement';
import { ServerPickupGunPacket } from '../../common/networking/game/ServerPickupGun';
import { ServerPlayerJoinPacket } from '../../common/networking/game/ServerPlayerJoin';
import { ServerPlayerLeavePacket } from '../../common/networking/game/ServerPlayerLeave';
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
