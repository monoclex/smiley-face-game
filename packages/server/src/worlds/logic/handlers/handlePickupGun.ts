import { PickupGunPacket } from "@smiley-face-game/api/packets/PickupGun";
import Connection from "@/websockets/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handlePickupGun(packet: PickupGunPacket, [sender, logic]: [Connection, RoomLogic]) {
  throw new Error("not implemented");
}
