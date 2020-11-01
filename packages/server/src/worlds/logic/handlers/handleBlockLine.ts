import { BlockLinePacket } from "@smiley-face-game/packets/BlockLine";
import Connection from "../../../worlds/Connection";
import RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handleBlockLine(packet: BlockLinePacket, [sender, logic]: [Connection, RoomLogic]) {
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

  const sendPacket = logic.blockHandler.handleLine(packet, sender);
  if (sendPacket !== undefined) {
    logic.broadcast(sendPacket);
  }
}
