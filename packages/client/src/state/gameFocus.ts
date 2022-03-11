import { MutableVariable } from "@/util/MutableVariable";
import { atom, selector, DefaultValue } from "recoil";
import SharedGlobal from "./SharedGlobal";

type GameFocus = typeof defaultGameFocusState;
const defaultGameFocusState = {
  chatOpen: false,
  settingsOpen: false,
};

export const gameFocusGlobal = new SharedGlobal<GameFocus>(defaultGameFocusState);

export const gameFocusState = atom<GameFocus>({
  key: "gameFocusState",
  default: defaultGameFocusState,
  effects_UNSTABLE: [gameFocusGlobal.initialize],
});

export const chatOpen = new MutableVariable(false);

export const settingsOpenState = selector<boolean>({
  key: "settingsOpenState",
  get: ({ get }) => get(gameFocusState).settingsOpen,
  set: ({ set }, value) => set(gameFocusState, (old) => ({ ...old, settingsOpen: value instanceof DefaultValue ? false : value })),
});
