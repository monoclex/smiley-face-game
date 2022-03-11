import { Emitter } from "@smiley-face-game/api/nanoevents";

export const gameEventEmitter = new Emitter<GameEvents>();

export interface GameEvents {
  onSignPlace(): void;
}
