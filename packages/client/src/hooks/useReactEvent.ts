import { reactEventEmitter, ReactEvents } from "@/ui/ReactEvents";
import type { DependencyList } from "react";
import useEvent from "./useEvent";

export default function useReactEvent<K extends keyof ReactEvents>(
  event: K,
  callback: ReactEvents[K],
  deps?: DependencyList | undefined
) {
  return useEvent(reactEventEmitter, event, callback, deps ?? []);
}
