import { ServerInitPacket } from "@smiley-face-game/packets/ServerInit";
import { NetworkClient } from "@smiley-face-game/common/NetworkClient";

export default interface GameSceneInitializationData {
  readonly networkClient: NetworkClient;
  readonly init: ServerInitPacket;
}
