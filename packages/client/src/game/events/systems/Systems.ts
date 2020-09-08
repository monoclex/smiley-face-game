import System from "./System";
import EventSystem from "@/game/events/EventSystem";
import KeyboardSystem from "./KeyboardSystem";
import MouseSystem from "./MouseSystem";
import PhaserSystem from "./PhaserSystem";

export default function prepare(): EventSystem {
  //@ts-ignore
  const eventSystem: EventSystem = { log: console.log, registerHook: (hook) => { eventSystem.activeHook = hook; hook(eventSystem); } };

  // LEVEL 0 SYSTEMS: systems with dependencies on no other system
  eventSystem.keyboard = new KeyboardSystem(eventSystem);
  eventSystem.mouse = new MouseSystem(eventSystem);
  eventSystem.phaser = new PhaserSystem(eventSystem);

  return eventSystem;
}