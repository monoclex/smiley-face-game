import type { Connection, Game } from "@smiley-face-game/api";
import type { Player } from "@smiley-face-game/api/physics/Player";
import { newRidgeState } from "./react-ridge-state";
import PromiseCompletionSource from "../PromiseCompletionSource";
import type ClientBlockBar from "./ClientBlockBar";
import type Keyboard from "./Keyboard";
import MouseInteraction from "./MouseInteraction";
import type GameRenderer from "./rendering/GameRenderer";

export const gameRunningState = newRidgeState<boolean | undefined>(undefined);

export const waitPromise = { it: new PromiseCompletionSource<GameState>() };

export interface GameState {
  game: Game;
  connection: Connection;
  gameRenderer: GameRenderer;
  keyboard: Keyboard;
  blockBar: ClientBlockBar;
  self: Player;
  mouseInteraction: MouseInteraction;
}

type StateOptional = Partial<GameState>;

interface StateWait {
  wait: Promise<GameState>;
}

const state: StateOptional & StateWait = { wait: waitPromise.it.handle };
export default state;
