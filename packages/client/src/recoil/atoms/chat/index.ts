import { atom, DefaultValue, selector } from "recoil";
import SharedGlobal from "../../SharedGlobal";
import { gameState } from "../gameState";

export const messagesState = selector({
  key: "messagesState",
  get: ({ get }) => get(gameState).messages,
});

interface ChatState {
  isActive: boolean;
  settingsOpen: boolean;
}

export const defaultChatState: ChatState = { isActive: false, settingsOpen: false };
export const chat = new SharedGlobal<ChatState>(defaultChatState);
export const chatState = atom<ChatState>({
  key: "chatState",
  default: defaultChatState,
  //@ts-ignore
  effects_UNSTABLE: [chat.initialize],
});

export const settingsOpen = selector<boolean>({
  key: "settingsOpen",
  get: ({ get }) => get(chatState).settingsOpen,
  set: ({ set }, value) =>
    set(chatState, (old) => ({ ...old, settingsOpen: value instanceof DefaultValue ? false : value })),
});
