import { Vector } from "../physics/Vector";
import { Simulator } from "./helpers.test-helper";

// in bugged SFG physics, you couldn't climb onto ledges with dots
it("players can climb onto ledges with dots", () => {
  const simulation = new Simulator(
    `
.   X
.p d.
`,
    {
      d: "dot",
    }
  );

  simulation.player.input.right = true;
  simulation.player.input.up = true;

  simulation.simulateMs(1000);

  expect(simulation.player.worldPosition).toEqual(simulation.goal);
});

describe("up arrows are not strong", () => {
  // in bugged SFG physics, you bounced four times before going through
  // a single arrow
  it("single arrow is not strong", () => {
    const simulation = new Simulator(
      `
.  .
.  .
.p^.
..X.
....
`
    );

    simulation.player.input.right = true;

    simulation.simulateMs(560);

    expect(simulation.player.worldPosition).toEqual(simulation.goal);
  });

  // in bugged SFG physics, double arrows were strong enough to never let you
  // pass through them
  it("double arrow is not strong", () => {
    const simulation = new Simulator(
      `
. .
. .
. .
.p.
.^.
.^.
.X.
...
`
    );

    simulation.simulateMs(2000);

    expect(simulation.player.worldPosition).toEqual(simulation.goal);
  });
});

it("players can perform 1x1s", () => {
  const simulation = new Simulator(
    `
.  .
. X.
. ..
. p.
. ..
. ..
....
`
  );

  simulation.player.input.left = true;

  // ee hookjump performable in a one-tick window of 15 ticks
  simulation.simulateTicks(15);

  simulation.player.input.jump = true;

  // some arbitrary amount of time in the air
  simulation.simulateMs(50);

  simulation.player.input.jump = false;
  simulation.player.input.left = false;
  simulation.player.input.right = true;

  // some arbitrary amount of time at which point we'll probably land
  simulation.simulateMs(500);

  expect(simulation.player.worldPosition).toEqual(simulation.goal);
});

// just some EE minigame that someone asked if it was possible in SFG
it("players can perform 'false hooks'", () => {
  const simulation = new Simulator(
    `
...^^..
.p   X.
...vv..
`,
    {
      "^": "boost-up",
      v: "boost-down",
    }
  );

  simulation.player.input.right = true;

  // brute fource: jump after 22 ticks
  simulation.simulateTicks(22);

  simulation.player.input.jump = true;

  // some arbitrary amount of time at which point we'll probably land
  simulation.simulateMs(500);

  expect(simulation.player.worldPosition).toEqual(simulation.goal);
});

// making sure arrow hovers are possible
it("players can perform arrow hover", () => {
  const simulation = new Simulator(
    `
. .
.^.
. .
.d.
. .
. .
. .
.p.
...
`,
    {
      d: "dot",
    }
  );

  simulation.player.input.right = false;
  simulation.player.input.jump = true;
  simulation.player.input.up = true;
  simulation.simulateMs(1000);

  // we expect the player to be hovering on the arrow
  const y = 1.5 * 16;
  const smallDelta = 0.1;

  expect(simulation.player.y).toBeGreaterThanOrEqual(y - smallDelta);
  expect(simulation.player.y).toBeLessThanOrEqual(y + smallDelta);
});

// in bugged SFG physics, after death the arrow grab minigame was no longer possible
it("players can perform arrow grabs after dying", () => {
  const simulation = new Simulator(
    `
. .
.^.
. .
.d.
. .
. .
. .
.p.
...
`,
    {
      d: "dot",
    }
  );

  simulation.player.revive(simulation.player.worldPosition);

  simulation.player.input.jump = true;
  simulation.player.input.up = true;
  simulation.simulateMs(1000);

  // we expect the player to be hovering on the arrow
  const y = 1.5 * 16;
  const smallDelta = 0.1;

  expect(simulation.player.y).toBeGreaterThanOrEqual(y - smallDelta);
  expect(simulation.player.y).toBeLessThanOrEqual(y + smallDelta);
});
