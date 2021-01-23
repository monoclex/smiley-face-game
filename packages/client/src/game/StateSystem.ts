import Game from "./Game";
import { captureGameState, GameState, statesAreEqual } from "./state";

/**
 * The state system is useful for knowing about differences in states between ticks. It can
 * be considered expensive, so it's not enabled by default.
 */
export default class StateSystem {
  private previousState?: GameState;
  enabled: boolean = false;

  onStateDifference?: (state: GameState) => void;

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
