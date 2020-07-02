import { Player } from './Player';

export interface InputState {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
}

export function captureInputs(player: Player): InputState {
  return {
    left: player.leftHeld,
    right: player.rightHeld,
    up: player.upHeld,
  };
}

export function inputsDiffer(previous: InputState, current: InputState): boolean {
  return !(previous.left === current.left
    && previous.right === current.right
    && previous.up === current.up
  );
}