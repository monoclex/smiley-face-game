import { atom } from "recoil";
import { LoadingScene } from "@/scenes/loading/LoadingScene";

export interface Message {
  id: number;
  timestamp: number;
  username: string;
  content: string;
}

export const messagesState = atom<Message[]>({
  key: "messagesState",
  default: [],
});

export interface ChatState {
  isActive: boolean;
}

export const chatState = atom<ChatState>({
  key: "chatState",
  default: {
    isActive: false,
  },
});
