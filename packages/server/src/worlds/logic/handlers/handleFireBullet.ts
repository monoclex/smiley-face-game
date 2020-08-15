import { FireBulletPacket } from "@smiley-face-game/api/packets/FireBullet";
import Connection from "@/websockets/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleFireBullet(packet: FireBulletPacket, [sender, logic]: [Connection, RoomLogic]) {
  throw new Error("not implemented");
}
