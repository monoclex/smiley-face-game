import System from "@/game/events/systems/System";
import EventSystem from "@/game/events/EventSystem";
import Deps from "@/game/events/Deps";

type PhaseEvent = "update";

export default class PhaserSystem extends System<PhaseEvent> {
  constructor(eventSystem: EventSystem) {
    super(eventSystem, PhaserSystem.name);
  }
  
  initialize({ scene }: Deps): void {
    scene.events.on("update", () => this.trigger("update", PhaserSystem));
  }
}