import type { Emitter } from "../nanoevents";
import type { ZSMovement } from "../packets";
import type { Player } from "./Player";

export interface PhysicsEvents {
  keyTouch(kind: "red", presser: Player): void;

  keyState(kind: "red", state: boolean): void;

  /**
   * When the player moves outside a blob of keys,
   * if that player is the current player, this is
   * a signal to the renderer to re-render what the
   * keys look like.
   */
  moveOutOfKeys(player: Player): void;

  signOn(x: number, y: number): void;
  signOff(): void;
}

export interface PhysicsSystem {
  /**
   * Specifies an optimal tick rate, in milliseconds per tick.
   * A value of `0` means that there is no optimal tick rate.
   */
  readonly optimalTickRate: number | 0;

  readonly events: Emitter<PhysicsEvents>;

  readonly ticks: number;

  readonly redKeyOn: boolean;

  update(elapsedMs: number, players: Player[]): void;

  triggerKey(kind: "red", deactivateTime: number, player: Player): void;

  updatePlayer(movement: ZSMovement, player: Player): void;
}
