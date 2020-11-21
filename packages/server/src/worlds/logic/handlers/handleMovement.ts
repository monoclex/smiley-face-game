import type { ZMovement } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handleMovement(packet: ZMovement, [sender, logic]: [Connection, RoomLogic]) {
  // TODO: does destructuring include non-required data? if so, this could be a mild vulnerability
  sender.lastPosition = { ...packet.position };

  logic.broadcastExcept(sender.playerId, {
    ...packet,
    packetId: "SERVER_MOVEMENT",
    playerId: sender.playerId!,
  });
}
