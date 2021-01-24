import { atom, selector, DefaultValue } from "recoil";
import SharedGlobal from "./SharedGlobal";

type GameFocus = typeof defaultGameFocusState;
const defaultGameFocusState = {
  chatOpen: false,
  settingsOpen: false,
};

export const gameFocusGlobal = new SharedGlobal<GameFocus>(defaultGameFocusState);

export const gameFocus = atom<GameFocus>({
  key: "gameFocus",
  default: defaultGameFocusState,
  //@ts-ignore
  effects_UNSTABLE: [gameFocusGlobal.initialize],
});

export const chatOpen = selector<boolean>({
  key: "chatOpen",
  get: ({ get }) => get(gameFocus).chatOpen,
  set: ({ set }, value) =>
    set(gameFocus, (old) => ({ ...old, settingsOpen: value instanceof DefaultValue ? false : value })),
});

export const settingsOpen = selector<boolean>({
  key: "settingsOpen",
  get: ({ get }) => get(gameFocus).settingsOpen,
  set: ({ set }, value) =>
    set(gameFocus, (old) => ({ ...old, settingsOpen: value instanceof DefaultValue ? false : value })),
});
