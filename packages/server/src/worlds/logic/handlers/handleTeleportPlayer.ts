import type { ZSTeleportPlayer, ZTeleportPlayer } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handleTeleportPlayer(
  packet: ZTeleportPlayer,
  [sender, logic]: [Connection, RoomLogic]
) {
  if (!sender.isOwner) return;

  const teleportPacket: ZSTeleportPlayer = {
    packetId: "SERVER_TELEPORT_PLAYER",
    teleportedPlayerId: packet.playerId,
    playerId: sender.playerId,
    position: packet.position,
  };

  if (packet.velocity) {
    teleportPacket.velocity = packet.velocity;
  }

  logic.broadcast(teleportPacket);
}
