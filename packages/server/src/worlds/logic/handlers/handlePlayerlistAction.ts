import type { ZPlayerListAction } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handlePlayerlistAction(
  packet: ZPlayerListAction,
  [sender, logic]: [Connection, RoomLogic]
) {
  // TODO: there's a lot of code duplication, but that's okay because it's only
  //   here and it's really really easy to fix
  switch (packet.action.action) {
    case "give edit":
      {
        // TODO: make this a property instead of manually comparing role for cleanliness
        if (sender.role !== "owner") return false;

        // TODO: wrap this outside or something
        const target = logic.player(packet.action.playerId);
        if (target === undefined) return;
        if (target.role === "owner") return; // TODO: when permissions aren't role-based, check if they already have edit

        target.role = "edit";
        target.hasEdit = true;
        logic.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.playerId,
          permission: "ROLE",
          newRole: "edit",
        });
      }
      return;

    case "remove edit":
      {
        if (sender.role !== "owner") return false;

        const target = logic.player(packet.action.playerId);
        if (target === undefined) return;
        if (target.role === "owner") return; // TODO: when permissions aren't role-based, remove this check and remove edit from owner

        target.role = "non";
        target.hasEdit = false;
        logic.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.playerId,
          permission: "ROLE",
          newRole: "non",
        });
      }
      return;

    case "kick":
      {
        if (sender.role !== "owner") return false;

        const target = logic.player(packet.action.playerId);
        if (target === undefined) return;

        target.kill("kicked");
      }
      return;

    case "give god":
      {
        if (sender.role !== "owner") return false;

        const target = logic.player(packet.action.playerId);
        if (target === undefined) return;
        if (target.role === "owner") return;

        target.canGod = true;
        logic.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.playerId,
          permission: "GOD",
          canGod: target.canGod,
        });
      }
      return;

    case "remove god":
      {
        if (sender.role !== "owner") return false;

        const target = logic.player(packet.action.playerId);
        if (target === undefined) return;
        if (target.role === "owner") return;

        target.canGod = false;
        logic.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.playerId,
          permission: "GOD",
          canGod: target.canGod,
        });
      }
      return;
  }
}
