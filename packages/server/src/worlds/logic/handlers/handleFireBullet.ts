import { FireBulletPacket } from "@smiley-face-game/packets/FireBullet";
import Connection from "../../../worlds/Connection";
import RoomLogic from "../../../worlds/logic/RoomLogic";
import { SERVER_FIRE_BULLET_ID } from "@smiley-face-game/packets/ServerFireBullet";

export default function handleFireBullet(packet: FireBulletPacket, [sender, logic]: [Connection, RoomLogic]) {
  // need to have a gun to shoot
  if (!sender.hasGun || !sender.gunEquipped) {
    return false;
  }

  logic.broadcast({
    packetId: SERVER_FIRE_BULLET_ID,
    angle: packet.angle,
    playerId: sender.playerId!,
  });

  return;
}
