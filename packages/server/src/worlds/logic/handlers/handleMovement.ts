import { MovementPacket } from "@smiley-face-game/api/packets/Movement";
import Connection from "@/websockets/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleMovement(packet: MovementPacket, [sender, logic]: [Connection, RoomLogic]) {
  throw new Error("not implemented");
}
