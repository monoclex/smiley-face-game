import { ServerInitPacket } from "@smiley-face-game/api/packets/ServerInit";
import { NetworkClient } from "@smiley-face-game/api/NetworkClient";

export default interface GameSceneInitializationData {
  readonly networkClient: NetworkClient;
  readonly init: ServerInitPacket;
}
