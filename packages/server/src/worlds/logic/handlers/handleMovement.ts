import { MovementPacket } from "@smiley-face-game/api/packets/Movement";
import { SERVER_MOVEMENT_ID } from "@smiley-face-game/api/packets/ServerMovement";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleMovement(packet: MovementPacket, [sender, logic]: [Connection, RoomLogic]) {
  // TODO: does destructuring include non-required data? if so, this could be a mild vulnerability
  sender.lastPosition = { ...packet.position };

  logic.broadcastExcept(sender.playerId, {
    ...packet,
    packetId: SERVER_MOVEMENT_ID,
    playerId: sender.playerId!
  });
}
