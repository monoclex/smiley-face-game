import System from "@/game/events/systems/System";
import EventSystem from "@/game/events/EventSystem";

interface MouseEvent {
}

export default class MouseSystem extends System<MouseEvent> {
  constructor(eventSystem: EventSystem) {
    super(eventSystem, MouseSystem.name);
  }
  
  initialize(): void {
    console.warn("TODO: initialize mouse system");
  }
}