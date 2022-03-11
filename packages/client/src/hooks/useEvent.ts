import { DependencyList, useEffect } from "react";
import type { Emitter, EventsMap, DefaultEvents } from "@smiley-face-game/api/nanoevents";

export default function useEvent<K extends keyof Events, Events extends EventsMap = DefaultEvents>(
  events: Emitter<Events>,
  event: K,
  callback: Events[K],
  deps?: DependencyList | undefined
) {
  return useEffect(() => events.on(event, callback), deps ?? []);
}
