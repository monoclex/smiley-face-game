import type { ZMovement } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";

export default function handleMovement(packet: ZMovement, [sender, server]: [Connection, Server]) {
  // TODO: does destructuring include non-required data? if so, this could be a mild vulnerability
  sender.lastPosition = { ...packet.position };

  server.broadcastExcept(sender, {
    ...packet,
    packetId: "SERVER_MOVEMENT",
    playerId: sender.id,
  });
}
