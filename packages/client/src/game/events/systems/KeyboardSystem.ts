import System from "@/game/events/systems/System";
import EventSystem from "@/game/events/EventSystem";

interface KeyboardEvent {
}

export default class KeyboardSystem extends System<KeyboardEvent> {
  constructor(eventSystem: EventSystem) {
    super(eventSystem, KeyboardSystem.name);
  }

  initialize(): void {
    console.warn("TODO: initialize keyboard system");
  }
}