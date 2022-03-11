import { createNanoEvents } from "@smiley-face-game/api/nanoevents";

export const gameEventEmitter = createNanoEvents<GameEvents>();

export interface GameEvents {
  onSignPlace(): void;
}
