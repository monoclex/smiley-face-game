import { ServerPacket } from "@smiley-face-game/api/packets/Server";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleServer<T extends ServerPacket>(packet: T, [sender, logic]: [Connection, RoomLogic]) {
  sender.kill("Sent server packet.");
}
