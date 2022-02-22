import type { Player } from "./Player";
import { Vector } from "./Vector";

export interface PhysicsEvents {
  keyTouch(kind: "red", presser: Player): void;

  keyState(kind: "red", state: boolean): void;

  /**
   * When the player moves outside a blob of keys,
   * if that player is the current player, this is
   * a signal to the renderer to re-render what the
   * keys look like.
   */
  playerKeyState(kind: "red", player: Player, state: boolean): void;

  signOn(player: Player, x: number, y: number): void;
  signOff(player: Player): void;

  checkpoint(player: Player, position: Vector): void;
}
