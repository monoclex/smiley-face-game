import KeyboardSystem from "./systems/KeyboardSystem";
import MouseSystem from "./systems/MouseSystem";
import PhaserSystem from "./systems/PhaserSystem";
import HookRegistration from "./hooks/HookRegistration";
import NetworkSystem from "./systems/NetworkSystem";

export default interface EventSystem {
  sender: Function;
  activeHook: Function;

  registerHook(hook: HookRegistration): void;

  log(...args: unknown[]): void;
  keyboard: KeyboardSystem;
  mouse: MouseSystem;
  phaser: PhaserSystem;
  network: NetworkSystem;
}
