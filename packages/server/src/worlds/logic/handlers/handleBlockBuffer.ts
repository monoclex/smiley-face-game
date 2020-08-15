import { BlockBufferPacket } from "@smiley-face-game/api/packets/BlockBuffer";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleBlockBuffer(packet: BlockBufferPacket, [sender, logic]: [Connection, RoomLogic]) {
  if (!sender.canPlaceBlocks) return false;

  const sendPacket = logic.blockHandler.handleBuffer(packet, sender);
  if (sendPacket !== undefined) {
    logic.broadcast(sendPacket);
  }
}
