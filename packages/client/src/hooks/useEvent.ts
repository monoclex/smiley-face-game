import type { Emitter, EventsMap, DefaultEvents } from "@smiley-face-game/api/nanoevents";
import { useEffectOnce } from "react-use";

export default function useEvent<K extends keyof Events, Events extends EventsMap = DefaultEvents>(
  events: Emitter<Events>,
  event: K,
  callback: Events[K]
) {
  return useEffectOnce(() => events.on(event, callback));
}
