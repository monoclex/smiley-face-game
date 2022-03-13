import { createNanoEvents } from "@smiley-face-game/api/nanoevents";

export interface ReactEvents {
  toggleSwitchWindow(on: boolean): void;
}

export const reactEventEmitter = createNanoEvents<ReactEvents>();
