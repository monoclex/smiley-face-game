import { gameEventEmitter, GameEvents } from "@/bridge/Events";
import useEvent from "./useEvent";

export default function useGameEvent<K extends keyof GameEvents>(
  event: K,
  callback: GameEvents[K]
) {
  return useEvent(gameEventEmitter, event, callback);
}
