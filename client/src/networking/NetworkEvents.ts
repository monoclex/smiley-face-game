import { NetworkClient } from './NetworkClient';
import { ServerBlockSinglePacket } from '../libcore/core/networking/game/ServerBlockSingle';
import { ServerMovementPacket } from '../libcore/core/networking/game/ServerMovement';
import { ServerPlayerJoinPacket } from '../libcore/core/networking/game/ServerPlayerJoin';
import { ServerPlayerLeavePacket } from '../libcore/core/networking/game/ServerPlayerLeave';
import { ServerInitPacket } from '../libcore/core/networking/game/ServerInit';

export type NetworkEventHandler<TEvent> = (event: TEvent, sender: NetworkClient) => void | Promise<void>;

export class NetworkEvents {
  onBlockSingle?: NetworkEventHandler<ServerBlockSinglePacket>;
  onMovement?: NetworkEventHandler<ServerMovementPacket>;
  onPlayerJoin?: NetworkEventHandler<ServerPlayerJoinPacket>;
  onPlayerLeave?: NetworkEventHandler<ServerPlayerLeavePacket>;
  onInit?: NetworkEventHandler<ServerInitPacket>;
}
