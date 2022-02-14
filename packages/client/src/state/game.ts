import { CheapPlayer } from "@smiley-face-game/api/physics/Player";
import { atom, selector } from "recoil";
import Message from "./Message";
import SharedGlobal from "./SharedGlobal";

export interface GameState {
  self: CheapPlayer;
  players: CheapPlayer[];
  messages: Message[];
}

const defaultGameState: GameState = {
  // TODO: don't have hardcoded weird defaults?
  self: { id: 0, username: "N/A", role: "non", canGod: false },
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
