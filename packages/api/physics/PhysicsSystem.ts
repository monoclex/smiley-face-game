import { ZSMovement } from "../packets";
import { Player } from "./Player";

/**
 * Events flagged during physics simulation that are useful to consumers
 */
export type PhysicsEvent = KeyEvent;

export interface KeyEvent {
  type: "key";
  presser: Player;
  key: "red";
}

export interface PhysicsSystem {
  update(deltaMs: number, players: Player[]): void;

  triggerKey(kind: "red", deactivateTime: number, player: Player): void;

  updatePlayer(movement: ZSMovement, player: Player): void;
}
