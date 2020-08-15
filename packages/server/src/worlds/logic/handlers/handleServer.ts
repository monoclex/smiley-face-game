import { ServerPacket } from "@smiley-face-game/api/networking/packets/Server";
import Connection from "@/websockets/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleServer<T extends ServerPacket>(packet: T, [sender, logic]: [Connection, RoomLogic]) {
  sender.kill("Sent server packet.");
}
