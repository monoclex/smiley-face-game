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
