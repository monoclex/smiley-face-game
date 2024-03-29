import { Game } from "..";
import { Blocks } from "../game/Blocks";
import { EE_TPS } from "../game/Game";
import { Players } from "../game/Players";
import { Config } from "../physics/Config";
import { EEPhysics } from "../physics/EEPhysics";
import { Player } from "../physics/Player";
import { Vector } from "../physics/Vector";
import createRegistration from "../tiles/createRegistration";

const tiles = createRegistration();

interface TemplateInfo {
  blocks: Blocks;
  playerPosition: Vector;
  goalPosition: Vector | null;
}

function createWorld(
  template: string,
  customCharMappings?: { [key: string]: string }
): TemplateInfo {
  const mappings: { [key: string]: string } = {
    ".": "basic-white",
    "^": "arrow-up",
    ">": "arrow-right",
    v: "arrow-down",
    "<": "arrow-left",
    ...(customCharMappings ?? {}),
  };

  const lines = template.trim().split("\n");

  const height = lines.length;
  const width = lines.map((line) => line.length).reduce((a, b) => Math.max(a, b));

  const blocks = new Blocks(tiles, [], [], { x: width, y: height });

  let playerPosition: Vector | null = null;
  let goalPosition: Vector | null = null;

  for (let y = 0; y < lines.length; y++) {
    const ys = lines[y];

    for (let x = 0; x < ys.length; x++) {
      const character = ys[x];
      const position = { x, y };

      switch (character) {
        case " ":
          break;

        case "p":
          if (playerPosition) throw new Error(`One player only supported at this time`);
          playerPosition = position;
          break;

        case "X":
          if (goalPosition) throw new Error(`One goal only supported at this time`);
          goalPosition = position;
          break;

        default:
          const mapping = mappings[character];

          if (mapping) {
            blocks.placeSingle(null, position, tiles.id(mapping), 0);
            break;
          }

          throw new Error(`Unrecognized template character ${character}`);
      }
    }
  }

  if (!playerPosition) throw new Error(`No player detected! Place a player 'p' in your template`);

  return {
    blocks,
    playerPosition,
    goalPosition,
  };
}

export class Simulator {
  readonly game;
  readonly player!: Player;
  readonly goal: Vector | null;

  constructor(world: string, customMappings?: { [key: string]: string }) {
    const { blocks, playerPosition, goalPosition } = createWorld(world, customMappings);
    this.goal = goalPosition;

    const players = new Players();
    const physics = new EEPhysics(tiles, blocks, EE_TPS);
    this.game = new Game(tiles, players, blocks, physics);

    this.player = new Player(
      0,
      "unit test",
      "non",
      false,
      Vector.mults(playerPosition, Config.blockSize),
      true,
      false
    );

    players.addPlayer(this.player);
  }

  private elapsed: number = 0;
  simulateMs(ms: number) {
    this.elapsed += ms;
    this.game.update(this.elapsed);
  }

  simulateTicks(ticks: number) {
    this.elapsed += this.game.physics.msPerTick * ticks;
    this.game.update(this.elapsed);
  }
}
