import type { ZFireBullet } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";

export default function handleFireBullet(
  packet: ZFireBullet,
  [sender, server]: [Connection, Server]
) {
  // need to have a gun to shoot
  if (!sender.hasGun || !sender.gunEquipped) {
    return false;
  }

  server.broadcast({
    packetId: "SERVER_FIRE_BULLET",
    angle: packet.angle,
    playerId: sender.id,
  });
}
