/* eslint-disable @typescript-eslint/no-use-before-define */
import Game from "./Game";
import Player from "./components/Player";
import deep from "fast-deep-equal";

/**
 * The state system is useful for knowing about differences in states between ticks. It can
 * be considered expensive, so it's not enabled by default.
 */
export default class StateSystem {
  private previousState?: GameState;

  onStateDifference?: (state: GameState) => void;

  /**
   * Returns if the state system is enabled and doing computations.
   * This is only true if there is a callback to handle on a state difference.
   */
  get enabled(): boolean {
    return Boolean(this.onStateDifference);
  }

  tick(game: Game) {
    if (!this.enabled) return;

    const state = captureGameState(game);

    if (statesAreEqual(this.previousState, state)) return;

    this.previousState = state;

    if (this.onStateDifference) {
      this.onStateDifference(state);
    }
  }
}

export const statesAreEqual = deep;

export interface GameState {
  self: PlayerState;
  players: PlayerState[];
}

export interface PlayerState {
  id: number;
  username: string;
  role: "non" | "edit" | "staff" | "owner"; // TODO: remove role in favor of permission based stuff
}

export function captureGameState(game: Game): GameState {
  const players: PlayerState[] = [];

  for (const player of game.players) {
    players.push(capturePlayerState(player));
  }

  // sort it so that the first element is the newest player
  players.sort((a, b) => b.id - a.id);

  return { self: capturePlayerState(game.self), players };
}

export function capturePlayerState(player: Player): PlayerState {
  return {
    id: player.id,
    username: player.username,
    role: player.role,
  };
}
