import System from "./System";
import KeyboardSystem from "@/game/events/systems/KeyboardSystem";
import MouseSystem from "@/game/events/systems/MouseSystem";
import EventSystem from "@/game/events/EventSystem";

export default function prepare(): EventSystem {
  //@ts-ignore
  const eventSystem: EventSystem = { log: console.log };

  // LEVEL 0 SYSTEMS: systems with dependencies on no other system
  eventSystem.keyboard = new KeyboardSystem(eventSystem);
  eventSystem.mouse = new MouseSystem(eventSystem);

  return eventSystem;
}