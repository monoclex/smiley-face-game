interface LoopCallback {
  /**
   * @returns If the loop should stop. In other words,
   *          `true` if it should stop, falsy if it should stop.
   */
  (deltaMs: number): unknown;
}

export function loopRequestAnimationFrame(callback: LoopCallback) {
  let now = 0;
  const rafCallback = (elapsed: number) => {
    const delta = elapsed - now;
    now = elapsed;

    const shouldStop = callback(delta);
    if (!shouldStop) requestAnimationFrame(rafCallback);
  };

  requestAnimationFrame(rafCallback);
}

export function loopSetInterval(callback: LoopCallback, interval: number) {
  const id = setInterval((delta) => {
    const shouldStop = callback(delta);
    if (shouldStop) clearTimeout(id);
  }, interval);
}

export function handleTimestep(callback: LoopCallback, optimalTickRate: number) {
  if (!optimalTickRate) loopRequestAnimationFrame(callback);
  else loopSetInterval(callback, optimalTickRate);
}
