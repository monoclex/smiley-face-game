import { createNanoEvents } from "@smiley-face-game/api/nanoevents";
import { Vector } from "@smiley-face-game/api/physics/Vector";

export const gameEventEmitter = createNanoEvents<GameEvents>();

export interface GameEvents {
  onBlockSelectionUpdate(worldPosition: Vector, screenPosition: Vector): void;
}
