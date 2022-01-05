import type { ZKeyTouch } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default async function handleKeyTouch(_packet: ZKeyTouch, [sender, logic]: [Connection, RoomLogic]) {
  const now = new Date();
  now.setSeconds(now.getSeconds() + 7);

  logic.broadcast({
    packetId: "SERVER_KEY_TOUCH",
    playerId: sender.playerId,
    kind: "red",
    deactivateTime: now.getTime(),
  });
}
