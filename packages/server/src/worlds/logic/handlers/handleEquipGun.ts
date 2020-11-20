import type { ZEquipGun } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default async function handleEquipGun(packet: ZEquipGun, [sender, logic]: [Connection, RoomLogic]) {
  // must have a gun to equip it
  if (!sender.hasGun) {
    return false;
  }

  // only send a new packet if the gun's equip state changed
  if (sender.gunEquipped == packet.equipped) {
    // don't disconnect the user if they send redundant packets
    console.warn("redundant equip packet sent by", sender.playerId);
    return;
  }

  sender.gunEquipped = packet.equipped;

  logic.broadcast({
    packetId: "SERVER_EQUIP_GUN",
    playerId: sender.playerId!,
    equipped: sender.gunEquipped,
  });

  return;
}
