export function* repeat<T>(arr: T[]) {
  while (true) {
    yield* arr;
  }
}

export function slice<T>(iterable: Iterable<T>, start: number, end: number) {
  let i = 0;
  const arr = [];
  for (const element of iterable) {
    if (i >= end) return arr;
    if (i++ < start) continue;

    arr.push(element);
  }

  return arr;
}
