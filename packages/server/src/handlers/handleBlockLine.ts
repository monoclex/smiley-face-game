import type { ZBlockLine } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";

export default function handleBlockLine(
  packet: ZBlockLine,
  [sender, server]: [Connection, Server]
) {
  if (!sender.canPlaceBlocks) {
    // don't kick the player, because if their edit was recently revoked, they might've sent some packets placing blocks
    // TODO(logging): inform about weird packet
    return;
  }

  const modifiedWorld = server.room.blocks.handleLine(packet, sender.id);
  if (!modifiedWorld) {
    return;
  }

  server.broadcast({
    ...packet,
    packetId: "SERVER_BLOCK_LINE",
    playerId: sender.id,
  });
}
