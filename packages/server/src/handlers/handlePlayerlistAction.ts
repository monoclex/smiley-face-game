import type { ZPlayerListAction } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";
import { Permission } from "../Permissions";

export default function handlePlayerlistAction(
  packet: ZPlayerListAction,
  [sender, server]: [Connection, Server]
) {
  // target may haave left by the time we got this message
  const target = server.connections.get(packet.action.playerId);
  if (target === undefined) return;

  // TODO: there's a lot of code duplication, but that's okay because it's only
  //   here and it's really really easy to fix
  switch (packet.action.action) {
    case "give edit":
      {
        if (!sender.permissions.has(Permission.ControlEdit)) return false;
        if (target.canEdit) return;

        target.canEdit = true;
        server.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.id,
          permission: "ROLE",
          newRole: "edit",
        });
      }
      return;

    case "remove edit":
      {
        if (!sender.permissions.has(Permission.ControlEdit)) return false;
        if (!target.canEdit) return;

        target.canEdit = false;
        server.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.id,
          permission: "ROLE",
          newRole: "non",
        });
      }
      return;

    case "kick":
      {
        if (!sender.permissions.has(Permission.KickPlayers)) return false;
        target.kill("You have been kicked!");
      }
      return;

    case "give god":
      {
        if (!sender.permissions.has(Permission.ControlGod)) return false;
        if (target.canGod) return;

        target.canGod = true;
        server.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.id,
          permission: "GOD",
          canGod: target.canGod,
        });
      }
      return;

    case "remove god":
      {
        if (!sender.permissions.has(Permission.ControlGod)) return false;
        if (!target.canGod && !target.inGod) return;

        target.canGod = false;
        target.inGod = false;
        server.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.id,
          permission: "GOD",
          canGod: target.canGod,
        });
      }
      return;
  }
}
