export { bresenhamsLine } from "@smiley-face-game/api/misc";

export function initArray<T>(width: number, height: number, value: T): T[][] {
  const result: T[][] = [];

  for (let y = 0; y < height; y++) {
    const current = [];
    result[y] = current;

    for (let x = 0; x < width; x++) {
      current.push(value);
    }
  }

  return result;
}
