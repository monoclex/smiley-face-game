import hooks from "@/game/events/hooks/HookList";
import prepare from "@/game/events/systems/Systems";
import EventSystem from "./EventSystem";

export default function events(): EventSystem {
  let eventSystem = prepare();

  for (const hook of hooks) {
    eventSystem.registerHook(hook);
  }

  // initialize the event systems after the hooks so that the hooks will be guaranteed to get all updates
  eventSystem.keyboard.initialize();
  eventSystem.mouse.initialize();

  return eventSystem;
}