import type { ZEquipGun } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";

export default async function handleEquipGun(
  packet: ZEquipGun,
  [sender, server]: [Connection, Server]
) {
  // must have a gun to equip it
  if (!sender.hasGun) {
    return false;
  }

  // only send a new packet if the gun's equip state changed
  if (sender.gunEquipped == packet.equipped) {
    // don't disconnect the user if they send redundant packets
    console.warn("redundant equip packet sent by", sender.id);
    return;
  }

  sender.gunEquipped = packet.equipped;

  server.broadcast({
    packetId: "SERVER_EQUIP_GUN",
    playerId: sender.id,
    equipped: sender.gunEquipped,
  });

  return;
}
