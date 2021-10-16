import { atom, selector } from "recoil";
import { GameState } from "../game/StateSystem";
import SharedGlobal from "./SharedGlobal";

const defaultGameState: GameState = {
  // TODO: don't have hardcoded weird defaults?
  self: { id: 0, username: "N/A", role: "non" },
  players: [],
  messages: [],
};

export const gameGlobal = new SharedGlobal<GameState>(defaultGameState);

export const gameState = atom<GameState>({
  key: "gameState",
  default: defaultGameState,
  effects_UNSTABLE: [gameGlobal.initialize],
});

export const playerListState = selector({
  key: "playerListState",
  get: ({ get }) => get(gameState).players,
});

export const currentPlayerState = selector({
  key: "currentPlayerState",
  get: ({ get }) => get(gameState).self,
});

export const messagesState = selector({
  key: "messagesState",
  get: ({ get }) => get(gameState).messages,
});
