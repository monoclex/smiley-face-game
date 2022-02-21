import { TileLayer } from "../../..";
import { Blocks } from "../../../game/Blocks";
import { Player } from "../../Player";
import { Vector } from "../../Vector";
import { BlockIdCache } from "../BlockIdCache";
import { Config } from "../Config";

export function* performZoosts(
  willCollide: (position: Vector) => boolean,
  world: Blocks,
  ids: BlockIdCache,
  self: Player,
  position: Vector,
  direction: Vector
): Generator<Vector, Vector> {
  let turns = 0;
  while (turns < 1) {
    const originalPosition = position;
    position = Vector.add(position, direction);

    // if we're colliding with a solid block, we need to not to that
    if (willCollide(position)) {
      // go back
      position = originalPosition;

      // do we have any other directions we could go?
      const actionBlockOn = world.blockAt(position, TileLayer.Action);
      if (ids.isZoost(actionBlockOn)) {
        direction = ids.zoostDirToVec(actionBlockOn);
        turns++;
        continue;
      }

      break;
    }

    // perform actions (trigger keys/etc)
    yield position;

    if (self.isDead) {
      break;
    }
  }

  return position;
}
