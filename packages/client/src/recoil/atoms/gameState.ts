import { atom } from "recoil";
import { GameState } from "../../game/StateSystem";
import SharedGlobal from "../../recoil/SharedGlobal";

// TODO: don't have hardcoded weird defaults?
export const defaultGameState: GameState = { self: { id: 0, username: "N/A", role: "non" }, players: [] };
export const game = new SharedGlobal<GameState>(defaultGameState);
export const gameState = atom<GameState>({
  key: "gameState",
  default: defaultGameState,
  //@ts-ignore
  effects_UNSTABLE: [game.initialize],
});
