import type { ZFireBullet } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handleFireBullet(packet: ZFireBullet, [sender, logic]: [Connection, RoomLogic]) {
  // need to have a gun to shoot
  if (!sender.hasGun || !sender.gunEquipped) {
    return false;
  }

  logic.broadcast({
    packetId: "SERVER_FIRE_BULLET",
    angle: packet.angle,
    playerId: sender.playerId!,
  });

  return;
}
