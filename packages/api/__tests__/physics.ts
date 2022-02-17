import { Simulator } from "./helpers.test-helper";

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
