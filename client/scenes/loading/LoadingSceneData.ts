import { ServerInitPacket } from '../../../common/networking/game/ServerInit';
import { NetworkClient } from '../../networking/NetworkClient';

export interface LoadingSceneData {
  readonly init: ServerInitPacket;
  readonly networkClient: NetworkClient;
}
