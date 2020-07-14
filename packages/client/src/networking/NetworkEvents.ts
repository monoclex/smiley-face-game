import { ServerBlockBufferPacket } from '@smiley-face-game/api/src/networking/game/ServerBlockBuffer';
import { ServerBlockLinePacket } from '@smiley-face-game/api/src/networking/game/ServerBlockLine';
import { ServerBlockSinglePacket } from '@smiley-face-game/api/src/networking/game/ServerBlockSingle';
import { ServerEquipGunPacket } from '@smiley-face-game/api/src/networking/game/ServerEquipGun';
import { ServerFireBulletPacket } from '@smiley-face-game/api/src/networking/game/ServerFireBullet';
import { ServerInitPacket } from '@smiley-face-game/api/src/networking/game/ServerInit';
import { ServerMovementPacket } from '@smiley-face-game/api/src/networking/game/ServerMovement';
import { ServerPickupGunPacket } from '@smiley-face-game/api/src/networking/game/ServerPickupGun';
import { ServerPlayerJoinPacket } from '@smiley-face-game/api/src/networking/game/ServerPlayerJoin';
import { ServerPlayerLeavePacket } from '@smiley-face-game/api/src/networking/game/ServerPlayerLeave';
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
