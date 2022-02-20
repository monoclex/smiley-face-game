import { Player } from "../../Player";
import { Vector } from "../../Vector";
import { Config } from "../Config";

export function performJumping(
  self: Player,
  grounded: boolean,
  currentGravityForce: Vector,
  currentGravity: Vector,
  delayedGravity: Vector,
  velocity: Vector
) {
  let tryToPerformJump = false;

  // if space has just been pressed, we want to jump immediately
  if (self.isSpaceJustPressed) {
    tryToPerformJump = true;
    self.waitedForInitialLongJump = "idle";
  }
  // otherwise, if space has been (or is just) held
  else if (self.isSpaceDown) {
    // if lastJump is negative, meaning
    // it is only negative if `isSpaceJustPressed` has been the "most recently"
    // pressed thing
    if (self.waitedForInitialLongJump === "waiting") {
      // if 750ms has elapsed since the last jump
      if (self.ticks - self.lastJump > 75) {
        // we want to perform a jump
        tryToPerformJump = true;
      }
    }
    // if `isSpaceJustPressed` is NOT the most recent thing,
    // i.e., we have been holding space for a while
    else {
      // if it's been 150ms
      if (self.ticks - self.lastJump > 15) {
        // we want to perform a jump automatically
        // this prevents the player from hitting jump too fast
        tryToPerformJump = true;
      }
    }
  }

  const horziontalGravityApplied = currentGravity.x && delayedGravity.y;
  const verticalGravityApplied = currentGravity.y && delayedGravity.y;

  if (
    // if either:
    // - we are not moving horizontally but we have horizontal force applied on us
    // - we are not moving vertically but we have vertical force applied on us
    ((velocity.x == 0 && horziontalGravityApplied) ||
      (velocity.y == 0 && verticalGravityApplied)) &&
    // and we're grounded
    grounded
  ) {
    // On ground so reset jumps to 0
    self.jumpCount = 0;
  }

  // we needs this here because - what if we never jumped and we're falling?
  // we don't want to let the player jump in mid-air just from falling
  if (self.jumpCount == 0 && !grounded) {
    self.jumpCount = 1; // Not on ground so first 'jump' removed
  }

  if (tryToPerformJump) {
    // if we can jump, AND we're being pulled in the X direction
    //
    // the `origModX` tells us the force of the CURRENT block we're in,
    // and the `modX` tells us the force of the PREVIOUS TICK'S block that we were in.
    //
    // it's very unlikely that that the origModX will differ from modX, so i don't think
    // we need to check both. plus we should only be checking delayed (modX) as physics
    // work based on the previous tick's block (or second prev block, depending on what's in the queue)
    const beingPulledByGravity = horziontalGravityApplied || verticalGravityApplied;

    if (self.jumpCount < self.maxJumps && beingPulledByGravity) {
      self.lastJump = self.ticks;
      self.jumpCount += 1;

      if (self.waitedForInitialLongJump === "idle") {
        self.waitedForInitialLongJump = "waiting";
      } else if (self.waitedForInitialLongJump === "waiting") {
        self.waitedForInitialLongJump = "jumped";
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
