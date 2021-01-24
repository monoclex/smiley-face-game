import { atom, selector } from "recoil";
import SharedGlobal from "../../SharedGlobal";
import { gameState } from "../gameState";

export const messagesState = selector({
  key: "messagesState",
  get: ({ get }) => get(gameState).messages,
});

interface ChatState {
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
