import hooks from "@/game/events/hooks/HookList";
import prepare from "@/game/events/systems/Systems";
import EventSystem from "./EventSystem";

export default function events(): EventSystem {
  let eventSystem = prepare();

  for (const hook of hooks) {
    eventSystem.activeHook = hook;
    hook(eventSystem);
  }

  eventSystem.keyboard.initialize();
  eventSystem.mouse.initialize();

  return eventSystem;
}