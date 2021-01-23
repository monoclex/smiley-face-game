// https://www.desmos.com/calculator/ftookaq2dd
export const PHYSICS_BASE_ACCELERATION = 0.26272;
export const PHYSICS_DRAG = 0.019596;
/** until i figure out a better way to get the deceleration right */
export const PHYSICS_DECELERATION_DRAG = PHYSICS_DRAG * 6.4392094;

/**
 * This equation is used to figure out the end position of the player (horizontally) given
 * their current velocity and x position. The base acceleration and drag are set to their default
 * values.
 * @param time The primary thing that changes - how much time to simulate moving the player for.
 * @param x The current x position of the player
 * @param xVelocity The current x velocity of the player (found via `velocity_after`)
 * @param drag The drag (affects how fast the player gets slowed down - would be used for ice blocks)
 * @param acceleration The acceleration (affects how fast the player speeds up - would be used for speed effect)
 */
export function position_after(
  time: number,
  x: number,
  xVelocity: number,
  accelMultiplier: number,
  drag?: number,
  acceleration?: number
): number {
  drag ??= PHYSICS_DRAG;
  acceleration ??= PHYSICS_BASE_ACCELERATION;
  acceleration *= accelMultiplier;

  // the actual function has it's `x` axis in terms of ee ticks (10ms per tick) and output based on a 16x16 game (*2 for 32x32)

  time /= 10.0; // ms -> ee ticks

  /*
how we arrived at this function was a lot of math, but to go straight from point A to point B
i sampled N1KF's physics simulation at a bunch of points (my spin https://jsfiddle.net/oy85h1rm/1/)
i sampled 3000 ticks and their positions, and noticed that it was constantly changing up until 1500 ticks.
to approximate it fast, i had to cut the approximation at some point

then i played in EE, and after about 3 seconds (300 ticks) the acceleration didn't feel like it was increasing
that much, so i decided i'd cut the amount of ticks i'd simulate at that point.

now that i had this, i took an equation from luke that looked something like p'' = a - r * p'
where `p(x)` would be the function below, and `a` and `r` would be the drag and resistance,
magic doo daa magic dee daa solved for `a` and `r`, and those are our magic constants

you can actually find this exact same formula in EEU too. what this function does is described in the documentation of this method
*/

  let result =
    (acceleration / drag - xVelocity) * ((Math.exp(-drag * time) - 1) / drag) + acceleration * (time / drag) + x;

  return result;
}

/**
 * This equation is used to figure out the end velocity of the player (horizontally) given
 * their current velocity and x position. The base acceleration and drag are set to their default
 * values.
 *
 * On a physics/math note, this is just the derivative of `position_at`.
 * @param time The primary thing that changes - how much time to simulate moving the player for.
 * @param x The current x position of the player
 * @param xVelocity The current x velocity of the player (found via `velocity_after`)
 * @param drag The drag (affects how fast the player gets slowed down - would be used for ice blocks)
 * @param baseAcceleration The acceleration (affects how fast the player speeds up - would be used for speed effect)
 */
export function velocity_after(
  time: number,
  x: number,
  xVelocity: number,
  accelMultiplier: number,
  drag?: number,
  acceleration?: number
): number {
  drag ??= PHYSICS_DRAG;
  acceleration ??= PHYSICS_BASE_ACCELERATION;
  acceleration *= accelMultiplier;

  // the actual function has it's `x` axis in terms of ee ticks (10ms per tick) and output based on a 16x16 game (*2 for 32x32)

  time /= 10.0; // ms -> ee ticks

  const k = Math.exp(-drag * time);
  let result = xVelocity * k + acceleration * ((1 - k) / drag);

  return result;
}
