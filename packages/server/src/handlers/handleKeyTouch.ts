import type { ZKeyTouch } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";

export default async function handleKeyTouch(
  packet: ZKeyTouch,
  [sender, server]: [Connection, Server]
) {
  const now = new Date();
  now.setSeconds(now.getSeconds() + 7);

  server.broadcast({
    packetId: "SERVER_KEY_TOUCH",
    playerId: sender.id,
    kind: packet.kind,
    deactivateTime: now.getTime(),
  });
}
