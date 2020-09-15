import { atom } from "recoil";
import { LoadingScene } from "@/scenes/loading/LoadingScene";

interface Message {
  id: number;
  timestamp: number;
  username: string;
  content: string;
}

export const messagesState = atom<Message[]>({
  key: "messagesState",
  default: [],
});

interface ChatState {
  isActive: boolean;
}

export const chatState = atom<ChatState>({
  key: "chatState",
  default: {
    isActive: false,
  },
});
