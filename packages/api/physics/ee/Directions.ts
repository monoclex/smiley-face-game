import { Vector } from "../Vector";

export const ArrowDirection = {
  Up: 0,
  Right: 1,
  Down: 2,
  Left: 3,
};
export const BoostDirection = {
  Up: 4,
  Right: 5,
  Down: 6,
  Left: 7,
};

export const ZoostDirection = {
  Up: 8,
  Right: 9,
  Down: 10,
  Left: 11,
};

export const isBoost = (boostDirection: number) => boostDirection >= BoostDirection.Up && boostDirection <= BoostDirection.Left;

export const isZoost = (zoostDirection: number) => zoostDirection >= ZoostDirection.Up && zoostDirection <= ZoostDirection.Left;

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
