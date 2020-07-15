import { NetworkClient } from '@smiley-face-game/api/src/networking/NetworkClient';
import { ServerInitPacket } from '@smiley-face-game/api/src/networking/packets/ServerInit';

export interface LoadingSceneData {
  readonly init: ServerInitPacket;
  readonly networkClient: NetworkClient;
}
