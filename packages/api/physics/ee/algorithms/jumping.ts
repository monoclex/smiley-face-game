import { Player } from "../../Player";
import { Vector } from "../../Vector";
import { Config } from "../Config";

export function performJumping(
  self: Player,
  grounded: boolean,
  currentGravityForce: Vector,
  currentGravity: Vector,
  delayedGravity: Vector,
  velocity: Vector,
  ticksUntilFirstJump: number,
  ticksUntilNthJump: number
) {
  let tryToPerformJump = false;

  if (self.isSpaceJustPressed) {
    tryToPerformJump = true;
    self.jumpTimes = "none";
  } else if (self.isSpaceDown) {
    if (self.jumpTimes === "once") {
      // if 750ms has elapsed since the last jump
      if (self.ticks - self.lastJump > ticksUntilFirstJump) {
        tryToPerformJump = true;
      }
    } else {
      // if it's been 150ms
      if (self.ticks - self.lastJump > ticksUntilNthJump) {
        tryToPerformJump = true;
      }
    }
  }

  const horziontalGravityApplied = currentGravity.x && delayedGravity.x;
  const verticalGravityApplied = currentGravity.y && delayedGravity.y;

  const movingHorizontally = velocity.x != 0;
  const movingVertically = velocity.y != 0;

  if (
    ((!movingHorizontally && horziontalGravityApplied) ||
      (!movingVertically && verticalGravityApplied)) &&
    grounded
  ) {
    // on the ground, reset jump count to 0
    self.jumpCount = 0;
  }

  // we needs this here because - what if we never jumped and we're falling?
  // we don't want to let the player jump in mid-air just from falling
  if (self.jumpCount == 0 && !grounded) {
    self.jumpCount = 1;
  }

  if (tryToPerformJump) {
    const beingPulledByGravity = horziontalGravityApplied || verticalGravityApplied;

    if (self.jumpCount < self.maxJumps && beingPulledByGravity) {
      self.lastJump = self.ticks;
      self.jumpCount += 1;

      if (self.jumpTimes === "none") {
        self.jumpTimes = "once";
      } else if (self.jumpTimes === "once") {
        self.jumpTimes = "many";
      }

      const jumpForce =
        (Config.physics.jump_height * self.jumpMult) / Config.physics.variable_multiplyer;

      // a vector `jumpForce` units against gravity
      const jumpVector = Vector.mults(Vector.negate(currentGravityForce), jumpForce);

      // update velocity to have jump force applied to it
      return Vector.substituteZeros(jumpVector, velocity);
    }
  }

  return velocity;
}
