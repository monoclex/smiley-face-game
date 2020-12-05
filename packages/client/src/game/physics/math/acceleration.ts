/**
 * This function returns the amount of pixels to accelerate the player, assuming that they've
 * been going in the same direction for `offset` milliseconds, and that they will continue to
 * do so for `durationMs` milliseconds.
 * @param offsetMs The amount of milliseconds to begin calculating how much we should move for
 */
export default function accelerate(offsetMs: number, durationMs: number): number {
  /*
  our mathy function below has two caveats:

  - it outputs in pixels for a 16x16 game
  - it takes in ee ticks, not ms

  thus, we account for it here
  */
  const from = offsetMs / 10.0;
  const to = from + durationMs / 10.0;
  return integrate(from, to) * 2;
}

/*
how we arrived at this function was a lot of math, but basically
i sampled N1KF's physics simulation at a bunch of points (my spin https://jsfiddle.net/oy85h1rm/1/)
i sampled 3000 ticks and their positions, and noticed that it was constantly changing up until 1500 ticks.
to approximate it fast, i had to cut the approximation at some point

then i played in EE, and after about 3 seconds (300 ticks) the acceleration didn't feel like it was increasing
that much, so i decided i'd cut the amount of ticks i'd simulate at that point.

then, i began to approximate the table of 300 points in desmos. having a single function approximate the entire thing
would give really inaccurate results, so i split it up into chunks of 50, 100, and 150 and that seems right.

now that we have the amount of pixels that a player moves per tick, we just need to make a function that returns
how much the player needs to move inbetween any two given points. from tick 0 to tick 1 is just p(1) - p(0).
from tick 2 to tick 6 is just p(6) - p(2). thus, we can simply use our p(x) function and subtract the two points
we need. bravo!
however, going from tick 49.999 to 50.001 will yield a *negative* result, because the individual piecewise functions
yield bad results. so we actually *have* to integrate the derivative of p(x)

= GOD FUNCTION =
p(x) =
  { 0 <= x <= 50:   -0.09807 + 0.108029x + 0.0590192x^2 -0.000251494x^3
  { 50 < x <= 150:  -35.3204 + 1.82976x + 0.0290674x^2 -0.0000628054x^3
  { 150 < x <= 300: -204.441 + 5.25008x + 0.00531242x^2 -0.00000632021x^3
  { x > 300:        1678.05513 + 6.7310753(x-300)
*/

function integrate(from: number, to: number): number {
  // TODO: clean this up somehow?

  // INTEGRATION: the individual pieces
  if (from < 50.0 && to <= 50.0) {
    return plt50(to, to * to) - plt50(from, from * from);
  } else if (from >= 50.0 && to <= 150.0) {
    return plt150(to, to * to) - plt150(from, from * from);
  } else if (from >= 150.0 && to <= 300.0) {
    return plt300(to, to * to) - plt300(from, from * from);
  } else if (from >= 300.0 && to > 300.0) {
    return pg300(to) - pg300(from);
  }

  // if we couldn't integrate our tiny piece in one, we have to integrate multiple pieces
  if (from < 50.0) return integrate(from, 50.0) + integrate(50.0, to);
  if (from < 150.0) return integrate(from, 150.0) + integrate(150.0, to);
  if (from < 300.0) return integrate(from, 300.0) + integrate(300.0, to);
  throw new Error("should never get here! (from: " + from + ", to: " + to + ")");
}

function plt50(x: number, x2: number): number {
  return -0.09807 + 0.108029 * x + 0.0590192 * x2 - 0.000251494 * x2 * x;
}

function plt150(x: number, x2: number): number {
  return -35.3204 + 1.82976 * x + 0.0290674 * x2 - 0.0000628054 * x2 * x;
}

function plt300(x: number, x2: number): number {
  return -204.441 + 5.25008 * x + 0.00531242 * x2 - 0.00000632021 * x2 * x;
}

function pg300(x: number): number {
  return 1678.05513 + 6.7310753 * (x - 300);
}
