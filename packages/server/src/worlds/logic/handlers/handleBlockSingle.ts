import { BlockSinglePacket } from "@smiley-face-game/api/packets/BlockSingle";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleBlockSingle(packet: BlockSinglePacket, [sender, logic]: [Connection, RoomLogic]) {
  if (!sender.canPlaceBlocks) return false;

  const sendPacket = logic.blockHandler.handleSingle(packet, sender);
  if (sendPacket !== undefined) {
    logic.broadcast(sendPacket);
  }
}
