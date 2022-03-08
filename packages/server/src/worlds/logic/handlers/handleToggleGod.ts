import type { ZToggleGod } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handleToggleGod(
  packet: ZToggleGod,
  [sender, logic]: [Connection, RoomLogic]
) {
  // ignore stupid packet
  if (packet.god === sender.inGod) {
    // TODO(logging): inform about weird packet
    return;
  }

  if (!sender.canGod) {
    // player can't god mode but tried to anyways
    // let us inform them that NO YOU CAN'T DO THAT!
    sender.send({
      packetId: "SERVER_TOGGLE_GOD",
      playerId: sender.playerId,
      god: sender.inGod,
    });
    return;
  }

  console.assert(sender.canGod && packet.god !== sender.inGod);
  sender.inGod = packet.god;

  // toggle their god (we don't need to tell them)
  logic.broadcastExcept(sender.playerId, {
    packetId: "SERVER_TOGGLE_GOD",
    playerId: sender.playerId,
    god: packet.god,
  });
}
