// todo: make a math folder?
export default function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampDid(value: number, min: number, max: number): [number, boolean] {
  if (value < min) {
    return [min, true];
  }

  if (value > max) {
    return [max, true];
  }

  return [value, false];
}
