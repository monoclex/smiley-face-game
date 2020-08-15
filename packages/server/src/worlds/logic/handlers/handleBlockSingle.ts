import { BlockSinglePacket } from "@smiley-face-game/api/packets/BlockSingle";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleBlockSingle(packet: BlockSinglePacket, [sender, logic]: [Connection, RoomLogic]) {
  // currently you can't place blocks above y 3 because placing blocks at (0, 1) and (1, 0) cause some really weird crud
  // it's a TODO to fix them, but for now this is a hot-fix.
  // and no this *shouldn't* be in the Schema validation because it's a hot-fix.
  if (packet.position.y < 3) return false;

  if (!sender.canPlaceBlocks) return false;

  const sendPacket = logic.blockHandler.handleSingle(packet, sender);
  if (sendPacket !== undefined) {
    logic.broadcast(sendPacket);
  }
}
