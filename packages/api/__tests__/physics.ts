import { Config } from "../physics/Config";
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

it("players can perform hold space 1x1s", () => {
  const simulation = new Simulator(
    `
.  .
. X.
. ..
. <.
. ..
.p..
....
`
  );

  simulation.player.input.right = true;
  simulation.player.input.jump = true;

  // some arbitrary amount of time spent attempting minigame
  simulation.simulateMs(2000);

  simulation.player.input.jump = false;
  simulation.player.input.left = false;

  // get them to stand still for a bit
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

describe("players go about the right amount", () => {
  it("players drop down the right amount of dots", () => {
    const simulation = new Simulator(
      `
p
d
d
d
d
d
d
d
d
d
`,
      {
        d: "dot",
      }
    );

    simulation.simulateMs(10_000);

    expect(simulation.player.y).toBeCloseTo(112, 4);
  });

  it("players go right the right amount of spaces", () => {
    const simulation = new Simulator(
      `
p
ddddddddddddddd
`,
      {
        d: "dot",
      }
    );

    simulation.player.input.right = true;

    simulation.simulateMs(250);

    simulation.player.input.right = false;

    simulation.simulateMs(2_000);

    expect(simulation.player.x).toBeCloseTo(160, 4);
  });

  it("players go right the right amount of spaces", () => {
    const simulation = new Simulator(
      `
p
............
`,
      {
        d: "dot",
      }
    );

    simulation.player.input.right = true;

    simulation.simulateMs(250);

    simulation.player.input.right = false;

    simulation.simulateMs(2_000);

    expect(simulation.player.x).toBeCloseTo(55.58909969359451, 4);
  });

  it("players jump up the right amount of dots", () => {
    const simulation = new Simulator([...new Array(21).fill("d"), "p"].join("\n"), {
      d: "dot",
    });

    simulation.player.input.jump = true;

    simulation.simulateMs(10_000);

    expect(simulation.player.y).toBeCloseTo(32, 4);
  });

  it("players go right the right amount of dots", () => {
    const simulation = new Simulator(
      `
p
ddddddddddddddd
`,
      {
        d: "dot",
      }
    );

    simulation.player.input.right = true;

    simulation.simulateMs(250);

    simulation.player.input.right = false;

    simulation.simulateMs(2_000);

    expect(simulation.player.x).toBeCloseTo(160, 4);
  });

  it("players go left the right amount of dots", () => {
    const simulation = new Simulator(
      `
.
            p
ddddddddddddd
`,
      {
        d: "dot",
      }
    );

    simulation.player.input.left = true;

    simulation.simulateMs(250);

    simulation.player.input.left = false;

    simulation.simulateMs(2_000);

    expect(simulation.player.x).toBeCloseTo(32, 4);
  });

  it("players go right the right amount of spaces", () => {
    const simulation = new Simulator(
      `
p
............
`,
      {
        d: "dot",
      }
    );

    simulation.player.input.right = true;

    simulation.simulateMs(250);

    simulation.player.input.right = false;

    simulation.simulateMs(2_000);

    expect(simulation.player.x).toBeCloseTo(55.58909969359451, 4);
  });

  it("players go left the right amount of spaces", () => {
    const simulation = new Simulator(
      `
.
     p
......
`,
      {
        d: "dot",
      }
    );

    simulation.player.input.left = true;

    simulation.simulateMs(250);

    simulation.player.input.left = false;

    simulation.simulateMs(2_000);

    expect(simulation.player.x).toBeCloseTo(24.350995961845303, 4);
  });
});

describe("autoalign", () => {
  it("does not modify on 0.2 away from right", () => {
    const simulation = new Simulator(
      `
..
 p
..
`
    );

    const pos = Config.blockSize + Config.physics.autoalign_range;

    simulation.player.x = pos;
    simulation.simulateMs(1000);
    expect(simulation.player.x).toEqual(pos);
  });

  it("does not modify on 0.2 away from left", () => {
    const simulation = new Simulator(
      `
..
p
..
`
    );

    const pos = Config.blockSize - Config.physics.autoalign_range;

    simulation.player.x = pos;
    simulation.simulateMs(1000);
    expect(simulation.player.x).toEqual(pos);
  });

  it("slowly drags the player left", () => {
    const simulation = new Simulator(
      `
..
 p
..
`
    );

    const pos = Config.blockSize + Config.physics.autoalign_range - 0.0001;

    simulation.player.x = pos;

    const inchingSteps = [
      17.866573333333335, 17.742135111111114, 17.625992770370374, 17.517593252345684,
      17.41642036885597, 17.32199234426557, 17.233859521314532, 17.15160221989356,
      17.074828738567323, 17.0031734893295, 16.936295256707535, 16.873875572927034,
      16.815617201398563, 16.761242721305326, 16.710493206551636, 16.663126992781528,
      16.618918526596094, 16.577657291489686, 16.539146805390374, 16.503203685031014,
      16.469656772695615, 16.438346321182575, 16.409123233103738, 16.38184835089682,
      16.356391794170367, 16.332632341225676, 16.31045685181063, 16.28975972835659,
      16.270442413132816, 16.252412918923962, 16.2355853909957, 16.219879698262652,
      16.20522105171181, 16.191539648264357, 16,
    ];

    for (const inch of inchingSteps) {
      simulation.simulateTicks(1);
      expect(simulation.player.x).toBeCloseTo(inch, 4);
    }

    expect(simulation.player.x).toEqual(16);
  });

  it("slowly drags the player right", () => {
    const simulation = new Simulator(
      `
..
p
..
`
    );

    const pos = Config.blockSize - Config.physics.autoalign_range + 0.001;

    simulation.player.x = pos;

    const inchingSteps = [
      14.001066666666667, 14.001137777777778, 14.00121362962963, 14.001294538271605,
      14.001380840823044, 14.001472896877914, 14.001571090003107, 14.001675829336648,
      14.001787551292425, 14.001906721378587, 14.00203383613716, 14.002169425212971,
      14.002314053560502, 14.002468323797869, 14.002632878717726, 14.002808403965576,
      14.002995630896613, 14.003195339623055, 14.003408362264592, 14.003635586415564,
      14.003877958843269, 14.00413648943282, 14.004412255395009, 14.004706405754677,
      14.005020166138321, 14.005354843880875, 14.005711833472933, 14.00609262237113,
      14.00649879719587, 14.006932050342263, 14.007394187031746, 14.007887132833863,
      14.008412941689453, 14.00897380446875, 14.0095720581, 14.010210195306666, 14.010890874993777,
      14.011616933326696, 14.012391395548475, 14.01321748858504, 14.01409865449071,
      14.01503856479009, 14.016041135776097, 14.017110544827837, 14.018251247816359,
      14.019467997670782, 14.020765864182168, 14.022150255127647, 14.023626938802824,
      14.025202068056347, 14.02688220592677, 14.028674352988554, 14.030585976521126,
      14.032625041622534, 14.03480004439737, 14.037120047357195, 14.039594717181009,
      14.042234364993076, 14.045049989325948, 14.048053321947679, 14.05125687674419,
      14.05467400186047, 14.058318935317834, 14.062206864339023, 14.066353988628292,
      14.070777587870177, 14.075496093728189, 14.080529166643402, 14.085897777752962,
      14.091624296269826, 14.097732582687815, 14.104248088200336, 14.111197960747026,
      14.118611158130161, 14.126518568672171, 14.134953139916982, 14.143950015911448,
      14.153546683638877, 14.163783129214803, 14.17470200449579, 14.186348804795509,
      14.198772058448544, 14.21202352901178, 14.2261584309459, 14.241235659675626,
      14.257318036987334, 14.27447257278649, 14.292770744305589, 14.312288793925962,
      14.33310804685436, 14.355315249977984, 14.37900293330985, 14.404269795530507,
      14.43122111523254, 14.459969189581377, 14.490633802220136, 14.523342722368145,
      14.558232237192689, 14.595447719672201, 14.635144234317014, 14.677487183271483,
      14.72265299548958, 14.770829861855553, 14.82221851931259, 14.877033087266764,
      14.935501959751214, 14.99786875706796, 15.064393340872492, 15.135352896930659,
      15.21104309005937, 15.291779296063329, 15.377897915800883, 15.469757776854275,
      15.56774162864456, 15.672257737220864, 15.783741586368922, 15.90265769212685, 16,
    ];

    for (const inch of inchingSteps) {
      simulation.simulateTicks(1);
      expect(simulation.player.x).toBeCloseTo(inch, 4);
    }

    expect(simulation.player.x).toEqual(16);
  });

  describe("has correct position values", () => {
    it("when holding right for 1 tick", () => {
      const simulation = new Simulator("p .");

      const xValues = [
        0, 0.12658920639726146, 0.2230234173493919, 0.30124411111087135, 0.36378974702858446,
        0.41288075149150816, 0.45045744095484347, 0.4782135378534885, 0.49762578434408566,
        0.5099801014275027, 0.5163946901079982, 0.5178404261091154, 0.5151588596396868,
        0.5090780962095434, 0.5002268030219144, 0.489146557564033, 0.47630273027625797,
        0.4620940712456011, 0.44686115142476185, 0.4308937916411734, 0.4144375973825024,
        0.3976997038039767, 0.38085382340231827, 0.3640446781665703, 0.3473918885930436,
        0.33099338360274877, 0.3149283880032941, 0.2992600375853314, 0.2840376661404397,
        0.2692988035478861, 0.25507091952663086, 0.24137294361941553, 0.22821658840850306,
        0.21560749980505203, 0.20354625545958352, 0.19202922986818638, 0,
      ];

      let holdRight = 1;
      for (const xValue of xValues) {
        simulation.player.input.right = holdRight > 0;
        holdRight--;

        expect(simulation.player.x).toBeCloseTo(xValue, 4);
        simulation.simulateTicks(1);
      }
    });

    it("when holding right for 2 ticks", () => {
      const simulation = new Simulator("p .");

      const xValues = [
        0, 0.12658920639726146, 0.37740287306511106, 0.5600305779645416, 0.7071341042758241,
        0.8237054431609473, 0.9141089613993861, 0.9821563723145391, 1.031172985919211,
        1.0640562379852063, 1.0833273840887705, 1.0911771438892475, 1.089505991512107,
        1.0799597086420447, 1.0639607466448004, 1.042735881714035, 1.0173405917826,
        0.9886805349477716, 0.9575304657293762, 0.9245508869799283, 0.8903027011394873,
        0.8552600942803263, 0.8198218595789176, 0.784321343095859, 0.7490351736928523,
        0.7141909202632882, 0.6799738029276153, 0.6465325702053516, 0.6139846412084593,
        0.5824206004161442, 0.5519081224206706, 0.5224953950282597, 0.4942141011261773,
        0.4670820126693214, 0.44110524389286526, 0.4162802053294654, 0.39259529531832943,
        0.3700323613664505, 0.34856795989517936, 0.32817443952094233, 0.3088208700267259,
        0.2904738365360707, 0.27309811606398865, 0.25665725155418573, 0.24111403668799522,
        0.22643092313982305, 0.21257036053212922, 0.19949507808828532, 0.18716831587478797, 0,
      ];

      let holdRight = 2;
      for (const xValue of xValues) {
        simulation.player.input.right = holdRight > 0;
        holdRight--;

        expect(simulation.player.x).toBeCloseTo(xValue, 4);
        simulation.simulateTicks(1);
      }
    });

    it("when holding right for 3 ticks", () => {
      const simulation = new Simulator("p .");

      const xValues = [
        0, 0.12658920639726146, 0.37740287306511106, 0.7501204284507018, 1.008892211719957,
        1.2157151450243495, 1.3779514102955714, 1.5020342574996706, 1.5935791646916553,
        1.6574820553137026, 1.6980060572245093, 1.7188581191285128, 1.7232566503588145,
        1.7139912172010456, 1.6934752112143414, 1.6637923006126984, 1.626737383209251,
        1.5838526773610553, 1.5364595145970976, 1.4856863331153776, 1.4324933141625908,
        1.3776940526339934, 1.3219746083166297, 1.265910244394401, 1.209980124560046,
        1.1545802088239634, 1.1000345604177155, 1.0466052516572768, 0.9945010348994229,
        0.9438849254763908, 0.8948808264472576, 0.8475793099094074, 0.8020426562482899,
        0.758309240871775, 0.7163973475023925, 0.676308477831958, 0.6380302191413912,
        0.6015387242322991, 0.5668008515983205, 0.5337760080876683, 0.5024177312890241,
        0.4726750444357625, 0.44449361270181165, 0.41781672629722294, 0.39258613271039605,
        0.3687427377404903, 0.34622719257673934, 0.3249803820747434, 0.3049438275210587,
        0.2860600155379424, 0.2682726633345995, 0.25152692923728165, 0.23576957630822196,
        0.22094909587505218, 0.20701579692245442, 0.19392186653254292, 0,
      ];

      let holdRight = 3;
      for (const xValue of xValues) {
        simulation.player.input.right = holdRight > 0;
        holdRight--;

        expect(simulation.player.x).toBeCloseTo(xValue, 4);
        simulation.simulateTicks(1);
      }
    });
  });
});

describe("jumping works lol", () => {
  it("player can jump up", () => {
    const simulation = new Simulator(
      `
>X
p.
`,
      {
        ">": "boost-right",
      }
    );

    simulation.player.input.jump = true;

    simulation.simulateMs(1000);

    expect(simulation.player.worldPosition).toEqual(simulation.goal);
  });

  it("player can jump right", () => {
    const simulation = new Simulator(
      `
<   .
< pX.
^<<..
`
    );

    simulation.player.input.jump = true;

    simulation.simulateMs(1000);

    expect(simulation.player.worldPosition).toEqual(simulation.goal);
  });
});

it("boosts propel the player the right amount of blocks", () => {
  const simulation = new Simulator(
    `
p
>]
[]. . . . .
 }         X
............
`,
    {
      "]": "prismarine-slab-right",
      "[": "prismarine-slab-left",
      "}": "boost-right",
    }
  );

  simulation.simulateMs(1000);

  expect(simulation.player.position).toEqual(Vector.mults(simulation.goal!, Config.blockSize));
});

it("afk minigame rotates player around", () => {
  const simulation = new Simulator(
    `
> p
>.<
^^<
`
  );

  simulation.simulateTicks(50);

  expect(simulation.player.worldPosition.x).toBeLessThan(2);
});
