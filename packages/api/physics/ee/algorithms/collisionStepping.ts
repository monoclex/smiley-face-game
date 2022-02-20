import { Player } from "../../Player";
import { Vector } from "../../Vector";

interface StepState {
  /** how far off the player is from a single pixel, `x % 1` where x is 16 units per block */
  pixelOffset: number;
  position: number;
  currentSpeed: number;
}

/**
 * This is the algorithm used when stepping the player a single pixel at a time,
 * checking for collisions along the way.
 *
 * Editors note: the algorithm for going to the right is implemented correctly,
 * but going left is very buggy. This buggyness is intentionally left alone, so
 * anything confusing about it is intentional.
 *
 * @param currentIsBoost Conditional that states whether the current block the
 * player is on is a boost
 */
export function* stepAlgo(currentIsBoost: boolean, me: StepState) {
  const goingRight = me.currentSpeed > 0;
  if (goingRight) {
    // align ourselves to the nearest pixel first, using speed to do so
    if (me.currentSpeed + me.pixelOffset >= 1) {
      me.position += 1 - me.pixelOffset;
      me.position >>= 0;
      me.currentSpeed -= 1 - me.pixelOffset;
      yield;
    }

    // move a full pixel at a time
    while (me.currentSpeed >= 1) {
      me.position += 1;
      me.position >>= 0;
      me.currentSpeed -= 1;
      yield;
    }

    // we don't have enough speed to move a full pixel, apply rest of speed
    me.position += me.currentSpeed;
    me.currentSpeed = 0;
    yield;
    return;
  }

  const goingLeft = me.currentSpeed < 0;
  if (goingLeft) {
    // hey! want to enable 4 block jump?
    // remove this conditional!:
    //  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    if (me.pixelOffset + me.currentSpeed < 0 && (me.pixelOffset !== 0 || currentIsBoost)) {
      // align ourselves to the nearest pixel, using speed to do so
      me.position -= me.pixelOffset;
      me.position >>= 0;
      me.currentSpeed += me.pixelOffset;
      yield;

      // while we can move a full pixel, move a full pixel
      while (me.currentSpeed < -1) {
        me.currentSpeed += 1;
        me.position -= 1;
        yield;
      }

      // consume the rest of our speed
      me.position += me.currentSpeed;
      me.currentSpeed = 0;
      yield;
    } else {
      // consume all of our speed all at once! (wow!)
      // why does ee do this? a hypothesis is that it's an optimzation
      me.position += me.currentSpeed;
      me.currentSpeed = 0;
      yield;
    }

    return;
  }
}

class StepAlgorithm {
  generator!: Generator;
  state!: StepState;
  done: boolean = false;
  collided: boolean = false;

  private steps = 0;

  constructor(readonly currentIsBoost: boolean, readonly initialState: StepState) {
    this.init();
  }

  private init() {
    this.state = { ...this.initialState };
    this.generator = stepAlgo(this.currentIsBoost, this.state);
  }

  step() {
    const result = this.generator.next();

    if (result.done) {
      this.done = true;
    }

    this.steps++;
  }

  back() {
    // to step back a state, we replay the generator from the very beginning... lol
    this.init();

    this.steps--;
    for (let step = 0; step < this.steps; step++) {
      this.generator.next();
    }
  }
}

export function collisionStepping(
  checkIsColliding: (position: Vector) => boolean,
  position: Vector,
  velocity: Vector,
  currentGravityDirection: Vector,
  currentIsBoost: boolean
) {
  const steppers = Vector.map(
    (position, currentSpeed) =>
      new StepAlgorithm(currentIsBoost, { position, currentSpeed, pixelOffset: position % 1 }),
    position,
    velocity
  );

  const getPositionFromState = () => Vector.map((stepper) => stepper.state.position, steppers);

  let grounded = false;

  const checkCollision = (
    velocity: number,
    currentGravityDirection: number,
    stepper: StepAlgorithm
  ) => {
    // if we are in collision with any blocks after stepping a singular pixel
    if (checkIsColliding(getPositionFromState())) {
      // if we are being pulled to the right,
      // but yet we still have speed to go right that was not yet applied
      // and we are also in collision with a block,
      // we must be grounded!
      if (velocity > 0 && currentGravityDirection > 0) grounded = true;
      // same for the other direction
      if (velocity < 0 && currentGravityDirection < 0) grounded = true;

      stepper.back();

      stepper.collided = true;
      stepper.done = true;
    }
  };

  const shouldStep = () => {
    const results = Vector.map((stepper) => stepper.state.currentSpeed && !stepper.done, steppers);
    return results.x || results.y;
  };

  while (shouldStep()) {
    steppers.x.step();
    checkCollision(velocity.x, currentGravityDirection.x, steppers.x);

    steppers.y.step();
    checkCollision(velocity.y, currentGravityDirection.y, steppers.y);
  }

  // if they collided, discord the velocity (mutliply it by 0) - otherwise, multiply it by 1
  const keep = Vector.map((stepper) => Number(!stepper.collided), steppers);
  velocity = Vector.mult(keep, velocity);

  return {
    position: getPositionFromState(),
    velocity,
    grounded,
  };
}
