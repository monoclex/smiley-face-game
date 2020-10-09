import { SERVER_CHAT_ID } from "@smiley-face-game/packets/ServerChat";
import { ChatPacket } from "@smiley-face-game/packets/Chat";
import Connection from "../../../worlds/Connection";
import RoomLogic from "../../../worlds/logic/RoomLogic";
import filterMessage from "@smiley-face-game/common/filterMessage";

const MAX_MESSAGES_WITHIN_INTERVAL = 10;
const INTERVAL_MS = 5 * 1000;

export default async function handleChat(
  packet: ChatPacket,
  [sender, logic]: [Connection, RoomLogic]
) {
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
  if (sender.messagesCounter > MAX_MESSAGES_WITHIN_INTERVAL) return;

  logic.broadcast({
    packetId: SERVER_CHAT_ID,
    playerId: sender.playerId!,
    message: packet.message,
  });
}
