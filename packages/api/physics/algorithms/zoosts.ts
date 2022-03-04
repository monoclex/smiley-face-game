import { TileLayer } from "../..";
import { Blocks } from "../../game/Blocks";
import { Player } from "../Player";
import { Vector } from "../Vector";
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
  // align ourselves to a pixel on the axis we're travelling in
  const alignedPosition = Vector.round(position);
  const alignedPositionInTravelAxis = Vector.substituteZeros(
    Vector.filterOut(direction, alignedPosition),
    position
  );
  if (willCollide(alignedPositionInTravelAxis)) return position;
  position = alignedPositionInTravelAxis;

  const largeDirectionJump = Vector.mults(direction, Config.blockSize);

  while (true) {
    const originalPosition = position;

    // are we aligned to a 16x16 grid in the direction we're travelling in?
    const careAboutAxisWereGoingIn = Vector.filterIn(direction, originalPosition);
    if (Vector.diviss(careAboutAxisWereGoingIn, Config.blockSize)) {
      // awesome - let's try go one full 16x16 block
      position = Vector.add(position, largeDirectionJump);

      if (!willCollide(position)) {
        // awesome, move there
        yield position;

        if (self.isDead) {
          break;
        }

        continue;
      } else {
        // oh well
        position = originalPosition;
      }
    }

    // try move one pixel at a time
    position = Vector.add(position, direction);

    // can't move anymore - stop
    if (willCollide(position)) {
      position = originalPosition;
      break;
    }

    yield position;

    if (self.isDead) {
      break;
    }
  }

  return position;
}
