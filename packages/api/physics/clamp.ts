// todo: make a math folder?
export default function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
