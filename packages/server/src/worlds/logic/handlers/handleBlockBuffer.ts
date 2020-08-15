import { BlockBufferPacket } from "@smiley-face-game/api/packets/BlockBuffer";
import Connection from "@/websockets/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleBlockBuffer(packet: BlockBufferPacket, [sender, logic]: [Connection, RoomLogic]) {
  throw new Error("not implemented");
}
