import { Config } from "../physics/Config";
import { Rectangle } from "../physics/Rectangle";
import { Vector } from "../physics/Vector";
import { directions } from "./register";

const origin = Vector.Zero;
const half = Config.blockSize / 2;
const edge = Vector.newScalar(Config.blockSize);
export const solidHitbox = new Rectangle(origin, edge);

export const slabHitbox: Record<typeof directions[number], Rectangle> = {
  up: new Rectangle(origin, new Vector(Config.blockSize, half)),
  down: new Rectangle(new Vector(0, half), edge),
  left: new Rectangle(origin, new Vector(half, Config.blockSize)),
  right: new Rectangle(new Vector(half, 0), edge),
};
