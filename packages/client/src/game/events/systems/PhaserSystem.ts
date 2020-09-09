/**
 * @description The Phaser System triggers events on updates, allowing coordination for code to run each frame from within the event system.
 */

import System from "@/game/events/systems/System";
import EventSystem from "@/game/events/EventSystem";
import Deps from "@/game/events/Deps";

// so far, "update" is the only event we need.
type PhaseEvent = "update";

export default class PhaserSystem extends System<PhaseEvent> {
  constructor(eventSystem: EventSystem) {
    super(eventSystem, PhaserSystem.name);
  }
  
  initialize({ scene }: Deps): void {
    scene.events.on("update", () => this.trigger("update", PhaserSystem));
  }
}