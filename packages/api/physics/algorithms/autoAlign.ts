import { Vector } from "../Vector";
import { Config } from "../Config";

const isSlow = (n: number) => n << 8 == 0; // Math.abs(n) < 1 / 256;
const lowPull = (n: number) => Math.abs(n) < 0.1;
const distance = (a: number, b: number) => Math.abs(a - b);

export function autoAlignVector(position: Vector, velocity: Vector, appliedForce: Vector): Vector {
  return Vector.map(autoAlignValue, position, velocity, appliedForce);
}

export function autoAlignValue(position: number, velocity: number, appliedForce: number): number {
  // don't auto align if far away
  if (!isSlow(velocity) || !lowPull(appliedForce)) {
    return position;
  }

  const blockOffset = position % Config.blockSize;

  // snap if close to block
  const leftEdge = 0;
  if (distance(leftEdge, blockOffset) < Config.physics.autoalign_snap_range) {
    return Math.floor(position);
  }

  const rightEdge = Config.blockSize;
  if (distance(rightEdge, blockOffset) < Config.physics.autoalign_snap_range) {
    return Math.ceil(position);
  }

  // nudge if not far from the block
  if (blockOffset < Config.physics.autoalign_range) {
    const nudge = blockOffset / (Config.blockSize - 1);
    return position - nudge;
  }

  const oppositeBlockOffset = 16 - blockOffset;
  if (oppositeBlockOffset < Config.physics.autoalign_range) {
    const nudge = (Config.physics.autoalign_range - oppositeBlockOffset) / (Config.blockSize - 1);
    return position + nudge;
  }

  // too far to auto align
  return position;
}
