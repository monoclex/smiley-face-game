import { BlockSinglePacket } from "@smiley-face-game/packets/BlockSingle";
import Connection from "../../../worlds/Connection";
import RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handleBlockSingle(packet: BlockSinglePacket, [sender, logic]: [Connection, RoomLogic]) {
  if (!sender.canPlaceBlocks) {
    // don't kick the player, because if their edit was recently revoked, they might've sent some packets placing blocks
    console.warn(
      "player attempted to place blocks when they weren't allowed to",
      sender.username,
      sender.authTokenPayload.aud,
      sender.playerId
    );
    return;
  }

  const sendPacket = logic.blockHandler.handleSingle(packet, sender);
  if (sendPacket !== undefined) {
    logic.broadcast(sendPacket);
  }
}
