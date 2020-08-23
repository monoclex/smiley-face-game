import Position from "./Position";

/**
 * Calculates a point `units` away from a giving `start` point, travelling in the `angle` direction.
 * @param start The starting point
 * @param angle The angle to begin travelling at, in radians.
 * @param units The amount of units to travel
 */
export default function distanceAway(start: Position, angle: number, units: number): Position {
  // TODO: phaser probably has some math function for this built in, should use it
  return {
    x: start.x + Math.cos(angle) * units,
    y: start.y + Math.sin(angle) * units,
  };
}
