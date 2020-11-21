import type { ZChat } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";
import filterMessage from "@smiley-face-game/api/filterMessage";

const MAX_MESSAGES_WITHIN_INTERVAL = 10;
const INTERVAL_MS = 5 * 1000;

export default async function handleChat(packet: ZChat, [sender, logic]: [Connection, RoomLogic]) {
  // filter the message incase some bot sends weird stuff i guess
  const content = filterMessage(packet.message);
  if (!content || content.length === 0) return;

  const now = new Date();

  // if they've sent a message within INTERVAL_MS of their last message
  // https://stackoverflow.com/a/9224799
  if (sender.lastMessage.getTime() > now.getTime() - INTERVAL_MS) {
    // count it against them
    sender.messagesCounter++;
  } else {
    // reset the counter
    sender.messagesCounter = 1;
  }

  sender.lastMessage = now;

  // if they've sent messages too fast, don't let them send the message
  if (sender.messagesCounter > MAX_MESSAGES_WITHIN_INTERVAL) {
    sender.send({
      packetId: "SERVER_EVENT",
      playerId: sender.playerId,
      event: {
        type: "chat rate limited",
        duration: INTERVAL_MS
      }
    });
    return;
  }

  logic.broadcast({
    packetId: "SERVER_CHAT",
    playerId: sender.playerId!,
    message: packet.message,
  });
}
