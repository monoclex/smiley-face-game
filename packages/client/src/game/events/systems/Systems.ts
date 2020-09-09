import System from "./System";
import EventSystem from "@/game/events/EventSystem";
import KeyboardSystem from "./KeyboardSystem";
import MouseSystem from "./MouseSystem";
import PhaserSystem from "./PhaserSystem";
import NetworkSystem from "./NetworkSystem";

/**
 * This function prepares a blank EventSystem by newing up every event system, as well as setting some of the preliminary requirements.
 */
export default function prepare(): EventSystem {
  //@ts-ignore
  const eventSystem: EventSystem = {
    log: console.log,
    registerHook: (hook) => {
      eventSystem.activeHook = hook;
      hook(eventSystem);
    }
  };

  // add new systems here as well
  // LEVEL 0 SYSTEMS: systems with dependencies on no other system
  eventSystem.keyboard = new KeyboardSystem(eventSystem);
  eventSystem.mouse = new MouseSystem(eventSystem);
  eventSystem.phaser = new PhaserSystem(eventSystem);
  eventSystem.network = new NetworkSystem(eventSystem);

  return eventSystem;
}