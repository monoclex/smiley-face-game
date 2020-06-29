import { ServerInitPacket } from '../../libcore/core/networking/game/ServerInit';
import { NetworkClient } from '../../networking/NetworkClient';

export interface LoadingSceneData {
  readonly init: ServerInitPacket;
  readonly networkClient: NetworkClient;
}
