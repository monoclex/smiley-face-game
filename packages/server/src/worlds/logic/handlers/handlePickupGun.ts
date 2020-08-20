import { SERVER_PICKUP_GUN_ID } from "@smiley-face-game/api/packets/ServerPickupGun";
import { PickupGunPacket } from "@smiley-face-game/api/packets/PickupGun";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handlePickupGun(packet: PickupGunPacket, [sender, logic]: [Connection, RoomLogic]) {
  
  // only allow collection of gun if it exists at specified location
  if (logic.blockHandler.map[TileLayer.Action][packet.position.y][packet.position.x].id !== TileId.Gun) {
    // we don't want to say this was invalid, because someone could've broke the gun block while someone else was trying to collect it.
    return;
  }

  sender.hasGun = true;
  sender.gunEquipped = true;

  logic.broadcast({
    packetId: SERVER_PICKUP_GUN_ID,
    playerId: sender.playerId!,
  });
}
