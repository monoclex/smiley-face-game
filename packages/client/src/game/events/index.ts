import prepare from "@/game/events/systems/Systems";
import EventSystem from "./EventSystem";
import Deps from "./Deps";

/**
 * This is the primary way to setup the event system.
 * The Event System allows for a functional way to register, handle, and pass around messages received.
 * This allows communication between components to be highly abstracted and not directly dependent on one another.
 * In theory, this will allow for code that more clearly describes its intent, at the cost of knowing the chain of action.
 * 
 * @param deps The dependencies needed by all the event systems.
 */
export default function events(deps: Deps): EventSystem {
  let eventSystem = prepare();

  // on initialization, each system will begin firing the events it receives
  // system initialization - add yours here
  eventSystem.keyboard.initialize();
  eventSystem.mouse.initialize(deps);
  eventSystem.phaser.initialize(deps);
  eventSystem.network.initialize(deps);

  return eventSystem;
}