import Schema, { string, Type } from "computed-types";
import { ServerSchema } from './Server';

export const SERVER_CHAT_ID = 'SERVER_CHAT';
export const ServerChatSchema = Schema.merge({
  packetId: SERVER_CHAT_ID as typeof SERVER_CHAT_ID,
  message: string.min(1).max(240), // NOTE: conditions must be modified in ServerChat too
}, ServerSchema);
export type ServerChatPacket = Type<typeof ServerChatSchema>;
export const validateServerChat = ServerChatSchema.destruct();
