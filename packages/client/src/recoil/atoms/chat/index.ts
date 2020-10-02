import { atom } from "recoil";
import SharedGlobal from "@/recoil/SharedGlobal";

export interface Message {
  id: number;
  timestamp: number;
  username: string;
  content: string;
}

export const defaultMessagesState: Message[] = [];
export const messages = new SharedGlobal<Message[]>(defaultMessagesState);
export const messagesState = atom<Message[]>({
  key: "messagesState",
  default: defaultMessagesState,
  //@ts-ignore
  effects_UNSTABLE: [messages.initialize],
});

export interface ChatState {
  isActive: boolean;
}

export const defaultChatState: ChatState = { isActive: false };
export const chat = new SharedGlobal<ChatState>(defaultChatState);
export const chatState = atom<ChatState>({
  key: "chatState",
  default: defaultChatState,
  //@ts-ignore
  effects_UNSTABLE: [chat.initialize],
});
