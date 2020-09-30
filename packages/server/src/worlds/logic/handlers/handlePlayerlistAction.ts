import { PlayerlistActionPacket } from "@smiley-face-game/api/packets/PlayerlistAction";
import Connection from "@/worlds/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";
import { SERVER_ROLE_UPDATE_ID } from "@smiley-face-game/api/packets/ServerRoleUpdate";

export default function handlePlayerlistAction(packet: PlayerlistActionPacket, [sender, logic]: [Connection, RoomLogic]) {
  switch (packet.action) {
    case "give edit": {
      // TODO: make this a property instead of manually comparing role for cleanliness
      if (sender.role !== "owner") return false;
      
      // TODO: wrap this outside or something
      const target = logic.player(packet.playerId);
      if (target === undefined) return;

      target.role = "edit";
      logic.broadcast({
        packetId: SERVER_ROLE_UPDATE_ID,
        playerId: target.playerId,
        newRole: "edit"
      });
    } return;
    
    case "remove edit": {
      if (sender.role !== "owner") return false;
      
      const target = logic.player(packet.playerId);
      if (target === undefined) return;

      target.role = "non";
      logic.broadcast({
        packetId: SERVER_ROLE_UPDATE_ID,
        playerId: target.playerId,
        newRole: "non"
      });
    } return;

    case "kick": {
      if (sender.role !== "owner") return false;
      
      const target = logic.player(packet.playerId);
      if (target === undefined) return;

      target.kill("kicked");
    } return;
  }
}
