import type { ZWorldAction } from "@smiley-face-game/api/packets";
import Server from "../Server";
import type Connection from "../Connection";
import { generateBlankWorld } from "../generateBlankWorld";
import { Permission } from "../Permissions";

export default async function handlePlayerlistAction(
  packet: ZWorldAction,
  [sender, server]: [Connection, Server]
) {
  const blocks = server.room.blocks;

  switch (packet.action.action) {
    case "save": {
      if (!sender.permissions.has(Permission.SaveWorld)) return false;

      await server.saveWorld();

      sender.send({
        packetId: "SERVER_WORLD_ACTION",
        action: { action: "save" },
        playerId: sender.id,
      });
      return;
    }
    case "load": {
      if (!sender.permissions.has(Permission.LoadWorld)) return false;

      await server.loadWorld();

      server.broadcast({
        packetId: "SERVER_WORLD_ACTION",
        action: {
          action: "load",
          blocks: blocks.state.state,
          heaps: blocks.heap.state,
        },
        playerId: sender.id,
      });
      return;
    }
    case "clear": {
      if (!sender.permissions.has(Permission.ClearWorld)) return false;

      server.room.deserialize(generateBlankWorld(blocks.size.x, blocks.size.y));

      server.broadcast({
        packetId: "SERVER_WORLD_ACTION",
        action: { action: "clear" },
        playerId: sender.id,
      });
      return;
    }
  }
}
