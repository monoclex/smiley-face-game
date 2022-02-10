import { GameState, waitPromise } from "../../bridge/state";

export function useGameState(): GameState {
  if (!waitPromise.it.resolved) throw waitPromise.it.handle;
  return waitPromise.it.resolvedValue;
}
