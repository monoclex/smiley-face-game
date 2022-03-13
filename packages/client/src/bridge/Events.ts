import { Game } from "@smiley-face-game/api";
import { createNanoEvents } from "@smiley-face-game/api/nanoevents";
import { ZSChat } from "@smiley-face-game/api/packets";
import { Vector } from "@smiley-face-game/api/physics/Vector";

export const gameEventEmitter = createNanoEvents<GameEvents>();

export interface GameEvents {
  onBlockSelectionUpdate(worldPosition: Vector, screenPosition: Vector): void;
  onMessageSent(message: ZSChat): void;
  onPlayerListUpdate(game: Game): void;
  onSelfUpdated(): void;
}
