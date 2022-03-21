import type { ZTime } from "@smiley-face-game/api/packets";
import type Connection from "../Connection";
import Server from "../Server";

export default function handleTime(
  packet: ZTime,
  [sender, server]: [Connection, Server],
  sent: number
) {
  const latency = Date.now() - sent;

  sender.send({
    packetId: "SERVER_TIME",
    playerId: sender.id,
    delay: latency,
    stamp: packet.stamp,
    ticks: server.room.ticks,
  });
}
