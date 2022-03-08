import type { ZBlockSingle } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handleBlockSingle(
  packet: ZBlockSingle,
  [sender, logic]: [Connection, RoomLogic]
) {
  if (!sender.canPlaceBlocks) {
    // don't kick the player, because if their edit was recently revoked, they might've sent some packets placing blocks
    // TODO(logging): inform about weird packet
    return;
  }

  const sendPacket = logic.blockHandler.handleSingle(packet, sender);
  if (sendPacket !== undefined) {
    logic.broadcast(sendPacket);
  }
}
