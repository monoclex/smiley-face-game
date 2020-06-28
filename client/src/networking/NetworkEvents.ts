import { ServerBlockSinglePacket } from '../libcore/core/networking/game/ServerBlockSingle';
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
}
