import { Vector } from "../Vector";

export const ArrowDirection = {
  Up: 1,
  Right: 2,
  Down: 3,
  Left: 4,
};
export const BoostDirection = {
  Up: 5,
  Right: 6,
  Down: 7,
  Left: 8,
};

export const ZoostDirection = {
  Up: 9,
  Right: 10,
  Down: 11,
  Left: 12,
};

export const SpikeDirection = {
  Up: 14,
  Right: 15,
  Down: 16,
  Left: 17,
};

export const isBoost = (boostDirection: number) =>
  boostDirection >= BoostDirection.Up && boostDirection <= BoostDirection.Left;

export const isZoost = (zoostDirection: number) =>
  zoostDirection >= ZoostDirection.Up && zoostDirection <= ZoostDirection.Left;

export const zoostDirToVec = (zoostDirection: number): Vector => {
  // prettier-ignore
  switch (zoostDirection) {
    case ZoostDirection.Up:    return Vector.Up;
    case ZoostDirection.Down:  return Vector.Down;
    case ZoostDirection.Left:  return Vector.Left;
    case ZoostDirection.Right: return Vector.Right;
    default:
      throw new Error("should not reach this");
  }
};
