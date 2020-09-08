import KeyboardSystem from "./systems/KeyboardSystem";
import MouseSystem from "./systems/MouseSystem";
import HookRegistration from "./hooks/HookRegistration";

export default interface EventSystem {
  sender: HookRegistration;
  activeHook: HookRegistration;

  log(...args: unknown[]): void;
  keyboard: KeyboardSystem;
  mouse: MouseSystem;
}
