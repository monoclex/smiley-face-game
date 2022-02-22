import { Config } from "../physics/ee/Config";
import { Rectangle } from "../physics/Rectangle";
import { Vector } from "../physics/Vector";

const origin = Vector.Zero;
const edge = Vector.newScalar(Config.blockSize);
export const solidHitbox = new Rectangle(origin, edge);
