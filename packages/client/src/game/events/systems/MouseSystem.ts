import System from "@/game/events/systems/System";
import EventSystem from "@/game/events/EventSystem";
import Deps from "@/game/events/Deps";

interface MouseEvent {
  id: number;
  down: boolean;
  x: number;
  y: number;
}

export default class MouseSystem extends System<MouseEvent> {
  constructor(eventSystem: EventSystem) {
    super(eventSystem, MouseSystem.name);
  }
  
  initialize({ input, camera }: Deps): void {
    
  }
}