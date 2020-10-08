import { NetworkClient } from "@smiley-face-game/common/NetworkClient";
import { ServerInitPacket } from "@smiley-face-game/common/packets/ServerInit";

export interface LoadingSceneData {
  readonly init: ServerInitPacket;
  readonly networkClient: NetworkClient;
}
