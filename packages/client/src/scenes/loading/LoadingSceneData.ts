import { NetworkClient } from '@smiley-face-game/api/NetworkClient';
import { ServerInitPacket } from '@smiley-face-game/api/packets/ServerInit';

export interface LoadingSceneData {
  readonly init: ServerInitPacket;
  readonly networkClient: NetworkClient;
}
