import { ServerPacket } from "@smiley-face-game/packets/Server";
import Connection from "../../../worlds/Connection";
import RoomLogic from "../RoomLogic";

export default function handleServer<T extends ServerPacket>(_: T, [sender]: [Connection, RoomLogic]) {
  sender.kill("Sent server packet.");
}
