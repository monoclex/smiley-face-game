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

export const game = atom<GameState>({
  key: "game",
  default: defaultGameState,
  //@ts-ignore
  effects_UNSTABLE: [gameGlobal.initialize],
});

export const playerList = selector({
  key: "playerList",
  get: ({ get }) => get(game).players,
});

export const currentPlayer = selector({
  key: "currentPlayer",
  get: ({ get }) => get(game).self,
});

export const messages = selector({
  key: "messages",
  get: ({ get }) => get(game).messages,
});
