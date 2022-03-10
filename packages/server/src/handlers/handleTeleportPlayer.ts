import type { ZSTeleportPlayer, ZTeleportPlayer } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";
import { Permission } from "../Permissions";

export default function handleTeleportPlayer(
  packet: ZTeleportPlayer,
  [sender, server]: [Connection, Server]
) {
  if (!sender.permissions.has(Permission.TeleportPlayer)) return;

  const teleportPacket: ZSTeleportPlayer = {
    packetId: "SERVER_TELEPORT_PLAYER",
    teleportedPlayerId: packet.playerId,
    playerId: sender.id,
    position: packet.position,
  };

  if (packet.velocity) {
    teleportPacket.velocity = packet.velocity;
  }

  server.broadcast(teleportPacket);
}
