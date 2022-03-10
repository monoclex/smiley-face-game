import type { ZPickupGun } from "@smiley-face-game/api/packets";
import type Connection from "../Connection";
import { TileLayer } from "@smiley-face-game/api/types";
import Server from "../Server";
import tiles from "../tiles";

export default function handlePickupGun(
  packet: ZPickupGun,
  [sender, server]: [Connection, Server]
) {
  // only allow collection of gun if it exists at specified location
  if (
    server.room.blocks.state.get(TileLayer.Action, packet.position.x, packet.position.y) !==
    tiles.id("gun")
  ) {
    // we don't want to say this was invalid, because someone could've broke the gun block while someone else was trying to collect it.
    return;
  }

  sender.hasGun = true;
  sender.gunEquipped = true;

  server.broadcast({
    packetId: "SERVER_PICKUP_GUN",
    playerId: sender.id,
  });
}
