import { BlockLinePacket } from "@smiley-face-game/api/packets/BlockLine";
import Connection from "@/websockets/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleBlockLine(packet: BlockLinePacket, [sender, logic]: [Connection, RoomLogic]) {
  throw new Error("not implemented");
}
