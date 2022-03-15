import { createNanoEvents } from "@smiley-face-game/api/nanoevents";

export interface ReactEvents {
  toggleSwitchWindow(on: boolean): void;
  selectedBlockChanged(id: number): void;
}

export const reactEventEmitter = createNanoEvents<ReactEvents>();
