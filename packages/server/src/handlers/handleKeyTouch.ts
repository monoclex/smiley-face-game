import type { ZKeyTouch } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";

export default async function handleKeyTouch(
  packet: ZKeyTouch,
  [sender, server]: [Connection, Server]
) {
  const TIME_KEY_DISABLES_IN_MILLISECONDS = 7000;

  const deactivateTick =
    server.room.ticks + TIME_KEY_DISABLES_IN_MILLISECONDS / server.room.msPerTick;

  server.broadcast({
    packetId: "SERVER_KEY_TOUCH",
    playerId: sender.id,
    kind: packet.kind,
    deactivateTick,
  });
}
