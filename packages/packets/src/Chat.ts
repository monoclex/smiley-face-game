import Schema, { string, Type } from "computed-types";

export const CHAT_ID = "CHAT";
export const ChatSchema = Schema({
  packetId: CHAT_ID as typeof CHAT_ID,
  message: string.min(1).max(240), // NOTE: conditions must be modified in ServerChat too
});
export type ChatPacket = Type<typeof ChatSchema>;
export const validateChat = ChatSchema.destruct();
