import { Player } from "../../Player";
import { Vector } from "../../Vector";

export function collisionStepping(
  checkIsColliding: (position: Vector) => boolean,
  position: Vector,
  velocity: Vector,
  currentGravityDirection: Vector,
  currentIsBoost: boolean
) {
  let keep = Vector.Ones;

  const speedX = velocity.x,
    x = position.x,
    factoryHorzState = () => ({ pos: x, remainder: x % 1, currentSpeed: speedX });

  const speedY = velocity.y,
    y = position.y,
    factoryVertState = () => ({ pos: y, remainder: y % 1, currentSpeed: speedY });

  let horzGenState = factoryHorzState();
  let vertGenState = factoryVertState();
  const getPositionFromState = () => ({ x: horzGenState.pos, y: vertGenState.pos });

  let grounded = false;

  let horzStepper = stepAlgo(currentIsBoost, horzGenState);
  let horzSteps = 0;

  let vertStepper = stepAlgo(currentIsBoost, vertGenState);
  let vertSteps = 0;

  const checkCollision = (velocity: number, currentGravityDirection: number, reset: () => void) => {
    // if we are in collision with any blocks after stepping a singular pixel
    if (checkIsColliding(getPositionFromState())) {
      // if we are being pulled to the right,
      // but yet we still have speed to go right that was not yet applied
      // and we are also in collision with a block,
      // we must be grounded!
      if (velocity > 0 && currentGravityDirection > 0) grounded = true;
      // same for the other direction
      if (velocity < 0 && currentGravityDirection < 0) grounded = true;

      reset();
    }
  };

  let doneX = false,
    doneY = false;

  // if we have x speed and we haven't collided yet (or same for y)
  while ((horzGenState.currentSpeed && !doneX) || (vertGenState.currentSpeed && !doneY)) {
    doneX = Boolean(horzStepper.next().done) || doneX;
    horzSteps++;
    checkCollision(velocity.x, currentGravityDirection.x, () => {
      // we ran into collision so we shouldn't move anymore
      keep = Vector.mutateX(keep, 0);

      // reset our generator to right before it performed this tick
      horzGenState = factoryHorzState();
      horzStepper = stepAlgo(currentIsBoost, horzGenState);

      horzSteps--;
      for (let i = 0; i < horzSteps; i++) {
        horzStepper.next();
      }

      doneX = true;
    });

    doneY = Boolean(vertStepper.next().done) || doneY;
    vertSteps++;
    checkCollision(velocity.y, currentGravityDirection.y, () => {
      // we ran into collision so we shouldn't move anymore
      keep = Vector.mutateY(keep, 0);

      // reset our generator to right before it performed this tick
      vertGenState = factoryVertState();
      vertStepper = stepAlgo(currentIsBoost, vertGenState);

      vertSteps--;
      for (let i = 0; i < vertSteps; i++) {
        vertStepper.next();
      }

      doneY = true;
    });
  }

  return {
    position: getPositionFromState(),
    velocity: Vector.mult(keep, velocity),
    grounded,
  };
}

export function* stepAlgo(
  currentIsBoost: boolean,
  me: { pos: number; remainder: number; currentSpeed: number }
) {
  // if we're going right
  if (me.currentSpeed > 0) {
    if (me.currentSpeed + me.remainder >= 1) {
      me.pos += 1 - me.remainder;
      me.pos >>= 0;
      me.currentSpeed -= 1 - me.remainder;
      yield;
    }

    while (me.currentSpeed >= 1) {
      me.pos += 1;
      me.pos >>= 0;
      me.currentSpeed -= 1;
      yield;
    }

    // we don't have enough speed to move a full pixel, apply rest of speed
    me.pos += me.currentSpeed;
    me.currentSpeed = 0;
    yield;
  }
  // if we're going left
  else if (me.currentSpeed < 0) {
    // note about this section: ee weirdness: if you're perfectly pixel aligned,
    // you consume all of your speed at once (lol)

    // hey! want to enable 4 block jump?
    // remove this conditional!:
    //  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    if (me.remainder + me.currentSpeed < 0 && (me.remainder !== 0 || currentIsBoost)) {
      // clip ourselves to the nearest pixel
      // me.pos = Math.trunc(me.pos);
      // use up some speed for moving
      // me.currentSpeed += me.remainder;
      me.pos -= me.remainder;
      me.pos >>= 0;
      me.currentSpeed += me.remainder;
      yield;

      while (me.currentSpeed < -1) {
        // while we can move a full pixel, move a full pixel
        me.currentSpeed += 1;
        me.pos -= 1;
        yield;
      }

      // consume the rest of our speed
      me.pos += me.currentSpeed;
      me.currentSpeed = 0;
      yield;
    } else {
      // consume all of our speed all at once! (wow!)
      me.pos += me.currentSpeed;
      me.currentSpeed = 0;
      yield;
    }
  }
}
