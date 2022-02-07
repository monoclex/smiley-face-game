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
  /**
   * Specifies an optimal tick rate, in milliseconds per tick.
   * A value of `0` means that there is no optimal tick rate.
   */
  readonly optimalTickRate: number | 0;

  get redKeyOn(): boolean;

  update(elapsedMs: number, players: Player[]): void;

  triggerKey(kind: "red", deactivateTime: number, player: Player): void;

  updatePlayer(movement: ZSMovement, player: Player): void;
}
