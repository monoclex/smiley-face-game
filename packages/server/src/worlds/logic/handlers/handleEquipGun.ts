import { EquipGunPacket } from "@smiley-face-game/api/packets/EquipGun";
import Connection from "@/websockets/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleEquipGun(packet: EquipGunPacket, [sender, logic]: [Connection, RoomLogic]) {
  throw new Error("not implemented");
}
