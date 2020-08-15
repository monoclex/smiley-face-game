import { MovementPacket } from "@smiley-face-game/api/packets/Movement";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";
import { SERVER_MOVEMENT_ID } from "../../../../../api/src/packets/ServerMovement";

export default function handleMovement(packet: MovementPacket, [sender, logic]: [Connection, RoomLogic]) {
  // TODO: does destructuring include non-required data? if so, this could be a mild vulnerability
  sender.lastPosition = { ...packet.position };

  logic.broadcast({
    ...packet,
    packetId: SERVER_MOVEMENT_ID,
    playerId: sender.playerId!
  });
}
