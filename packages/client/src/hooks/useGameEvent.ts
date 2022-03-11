import { gameEventEmitter, GameEvents } from "@/bridge/Events";
import type { DependencyList } from "react";
import useEvent from "./useEvent";

export default function useGameEvent<K extends keyof GameEvents>(
  event: K,
  callback: GameEvents[K],
  deps?: DependencyList | undefined
) {
  return useEvent(gameEventEmitter, event, callback, deps ?? []);
}
