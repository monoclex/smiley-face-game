import { Simulator } from "./helpers.test-helper";

it("players can climb onto ledges with dots", () => {
  const simulation = new Simulator(
    `
......
.   X.
.p d..
......
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
