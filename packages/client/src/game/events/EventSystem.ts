import KeyboardSystem from "./systems/KeyboardSystem";
import MouseSystem from "./systems/MouseSystem";
import PhaserSystem from "./systems/PhaserSystem";
import EventHook from "./EventHook";
import NetworkSystem from "./systems/NetworkSystem";

export default interface EventSystem {
  /** Global state to make figuring out who sent an event completely transparent to developers. */
  sender: Function;
  /** Global state to make logging what event is responsible for the currently running event handler completely transparent to developers. */
  activeHook: Function;

  /** Helper function that sets the `activeHook` before calling `hook` with the `this` event system. */
  registerHook(hook: EventHook): void;

  /** Logs a message. Typically, this will have write to console.log with some extra details about the current event handler. */
  log(...args: unknown[]): void;

  // systems - make sure to add new ones here
  keyboard: KeyboardSystem;
  mouse: MouseSystem;
  phaser: PhaserSystem;
  network: NetworkSystem;
}
