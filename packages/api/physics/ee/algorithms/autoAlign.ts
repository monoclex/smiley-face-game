import { Vector } from "../../Vector";
import { Config } from "../Config";

const isSlow = (n: number) => Math.abs(n) < 1 / 256;
const lowPull = (n: number) => Math.abs(n) < 0.1;
const distance = (a: number, b: number) => Math.abs(a - b);

export function autoAlignVector(position: Vector, velocity: Vector, appliedForce: Vector): Vector {
  return Vector.map(autoAlignValue, position, velocity, appliedForce);
}

export function autoAlignValue(position: number, velocity: number, appliedForce: number): number {
  if (!isSlow(velocity) || !lowPull(appliedForce)) {
    return position;
  }

  const blockOffset = position % Config.blockSize;

  const blockCoords = position / Config.blockSize;

  const leftBlock = Math.floor(blockCoords) * Config.blockSize;
  if (distance(leftBlock, position) < Config.physics.autoalign_snap_range) {
    return leftBlock;
  }

  const rightBlock = Math.ceil(blockCoords) * Config.blockSize;
  if (distance(rightBlock, position) < Config.physics.autoalign_snap_range) {
    return rightBlock;
  }

  if (blockOffset < Config.physics.autoalign_range) {
    const nudge = -blockOffset / (Config.blockSize - 1);
    return position + nudge;
  }

  const oppositeBlockOffset = 16 - blockOffset;
  if (oppositeBlockOffset < Config.physics.autoalign_range) {
    const nudge = (Config.physics.autoalign_range - oppositeBlockOffset) / (Config.blockSize - 1);
    return position + nudge;
  }

  // did not auto align
  return position;
}
