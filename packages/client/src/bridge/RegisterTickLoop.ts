interface LoopCallback {
  /**
   * @returns If the loop should stop. In other words,
   *          `true` if it should stop, falsy if it should stop.
   */
  (elapsedMs: number): unknown;
}

export function loopRequestAnimationFrame(callback: LoopCallback) {
  const rafCallback = (elapsed: number) => {
    const shouldStop = callback(elapsed);
    if (!shouldStop) requestAnimationFrame(rafCallback);
  };

  requestAnimationFrame(rafCallback);
}

export function loopSetInterval(callback: LoopCallback, interval: number) {
  const start = Date.now();
  const id = setInterval(() => {
    const shouldStop = callback(Date.now() - start);
    if (shouldStop) clearTimeout(id);
  }, interval);
}