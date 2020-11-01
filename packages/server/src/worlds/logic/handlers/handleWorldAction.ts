import { WorldActionPacket } from "@smiley-face-game/packets/WorldAction";
import Connection from "../../../worlds/Connection";
import RoomLogic from "../../../worlds/logic/RoomLogic";
import { SERVER_WORLD_ACTION_ID } from "@smiley-face-game/packets/ServerWorldAction";

export default async function handlePlayerlistAction(
  packet: WorldActionPacket,
  [sender, logic]: [Connection, RoomLogic]
) {
  if (sender.role !== "owner") {
    // must be owner to send these packets
    // you can't fake this no matter what you do, so we'll kill the client if they do this
    return false;
  }

  switch (packet.action) {
    case "save": {
      await logic.behaviour.saveBlocks(logic.blockHandler.map);

      sender.send({
        packetId: SERVER_WORLD_ACTION_ID,
        action: "save",
        playerId: sender.playerId
      });
      return;
    }
    case "load": {
      sender.send({
        packetId: SERVER_WORLD_ACTION_ID,
        action: "load",
        blocks: [[[]]],
        playerId: sender.playerId
      });
      return;
    }
  }
}
