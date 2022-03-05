import { Game } from "..";

interface SimulationOptions {
  /**
   * The millisecond value to pass to the second argument of `setInterval`. If left
   * unspecified, this will default to the default milliseconds per tick rate of the
   * physics.
   */
  frequency?: number;
}

class SimulationHandle {
  constructor(readonly stop: () => void) {}
}

export default function simulatePhysics(game: Game, options?: SimulationOptions): SimulationHandle {
  const start = Date.now();

  const frequency = options?.frequency ?? game.physics.msPerTick;

  const intervalId = setInterval(() => game.update(Date.now() - start), frequency);
  const stopHandle = () => clearInterval(intervalId);

  return new SimulationHandle(stopHandle);
}

interface LoopCallback {
  /**
   * @returns If the loop should stop. In other words,
   *          `true` if it should stop, falsy if it should stop.
   */
  (elapsedMs: number): unknown;
}

export function loopRequestAnimationFrame(callback: LoopCallback) {
  let initial = 0;

  const rafCallback = (elapsed: number) => {
    const shouldStop = callback(elapsed - initial);
    if (!shouldStop) requestAnimationFrame(rafCallback);
  };

  requestAnimationFrame((initialElapsed) => {
    initial = initialElapsed;
    const shouldStop = callback(0);
    if (!shouldStop) requestAnimationFrame(rafCallback);
  });
}

export function loopSetInterval(callback: LoopCallback, interval: number) {
  const start = Date.now();
  const id = setInterval(() => {
    const shouldStop = callback(Date.now() - start);
    if (shouldStop) clearTimeout(id);
  }, interval);
}

export class PhysicsTicker {
  constructor(private readonly game: Game, private readonly cap: number = -1) {}

  update(elapsedMs: number) {
    const timeSince = elapsedMs - this.game.physics.ticks * this.game.physics.msPerTick;
    const ticksToSimulate = Math.floor(timeSince / this.game.physics.msPerTick);

    if (this.cap !== -1 && ticksToSimulate >= this.cap) {
      // we've hit the threshold of ticks to simulate
      // so we're only gonna simulate `cap` ticks

      const ticksToSkip = ticksToSimulate - this.cap;

      this.game.physics.ticks += ticksToSkip;
      this.simulateTicks(this.cap);
      return;
    }

    // we're not simulating too many ticks - simulate them all
    this.simulateTicks(ticksToSimulate);
  }

  private simulateTicks(ticks: number) {
    for (let i = 0; i < ticks; i++) {
      this.game.physics.tick(this.game.players.list);
    }
  }
}
