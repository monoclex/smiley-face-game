import { BlockLinePacket } from "@smiley-face-game/api/packets/BlockLine";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleBlockLine(packet: BlockLinePacket, [sender, logic]: [Connection, RoomLogic]) {
  if (!sender.canPlaceBlocks) return false;

  const sendPacket = logic.blockHandler.handleLine(packet, sender);
  if (sendPacket !== undefined) {
    logic.broadcast(sendPacket);
  }
}
