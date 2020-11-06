import type { ZWorldAction } from "@smiley-face-game/common/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default async function handlePlayerlistAction(packet: ZWorldAction, [sender, logic]: [Connection, RoomLogic]) {
  if (sender.role !== "owner") {
    // must be owner to send these packets
    // you can't fake this no matter what you do, so we'll kill the client if they do this
    return false;
  }

  switch (packet.action.action) {
    case "save": {
      await logic.behaviour.saveBlocks(logic.blockHandler.map);

      sender.send({
        packetId: "SERVER_WORLD_ACTION",
        action: { action: "save" },
        playerId: sender.playerId
      });
      return;
    }
    case "load": {
      const blocks = await logic.behaviour.loadBlocks();
      logic.blockHandler.map = blocks;

      logic.broadcast({
        packetId: "SERVER_WORLD_ACTION",
        action: { action: "load", blocks: blocks },
        playerId: sender.playerId,
      });
      return;
    }
  }
}
