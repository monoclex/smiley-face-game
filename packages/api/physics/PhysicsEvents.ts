import { ZKeyKind, ZSwitchId } from "../types";
import { EEPhysics } from "./EEPhysics";
import type { Player } from "./Player";
import { Vector } from "./Vector";

export interface PhysicsEvents {
  keyTouch(kind: ZKeyKind, presser: Player): void;

  keyState(kind: ZKeyKind, state: boolean): void;

  /**
   * When the player moves outside a blob of keys,
   * if that player is the current player, this is
   * a signal to the renderer to re-render what the
   * keys look like.
   */
  playerKeyState(kind: ZKeyKind, player: Player, state: boolean): void;

  touchSwitch(player: Player, switchId: ZSwitchId, previousState: boolean): void;
  switchStateChanged(player: Player, switchId: ZSwitchId, state: boolean): void;

  signOn(player: Player, x: number, y: number): void;
  signOff(player: Player): void;

  checkpoint(player: Player, position: Vector): void;

  death(player: Player): void;

  /**
   * Event that gets fired before a physics tick is simulated.
   */
  beforeTick(physics: EEPhysics, players: Player[]): void;

  /**
   * Event that gets fired after a single physics tick has been simulated.
   */
  onTick(physics: EEPhysics, players: Player[]): void;
}
