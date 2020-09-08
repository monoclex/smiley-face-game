import hooks from "@/game/events/hooks/HookList";
import prepare from "@/game/events/systems/Systems";
import EventSystem from "./EventSystem";

interface Deps {
  input: Phaser.Input.InputPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
}

export default function events(deps: Deps): EventSystem {
  let eventSystem = prepare();

  for (const hook of hooks) {
    eventSystem.registerHook(hook);
  }

  // initialize the event systems after the hooks so that the hooks will be guaranteed to get all updates
  eventSystem.keyboard.initialize();
  eventSystem.mouse.initialize(deps);

  return eventSystem;
}