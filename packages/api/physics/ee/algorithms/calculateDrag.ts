import { Vector } from "../../Vector";
import { Config } from "../Config";

export function calculateDragVector(
  velocity: Vector,
  appliedForce: Vector,
  movementDirection: Vector,
  currentGravityDirection: Vector
) {
  return Vector.map(
    calculateDragValue,
    velocity,
    appliedForce,
    movementDirection,
    Vector.swap(currentGravityDirection)
  );
}

export function calculateDragValue(
  velocity: number,
  appliedForce: number,
  axisMovement: number,
  crossAxisGravity: number
) {
  // NOTES: we could actually run through this code no matter what, couldn't we?
  // basically if speedx/modifierx is 0, all the multiplication will have no effect
  //
  // if our horizontal speed is changing
  if (!(velocity || appliedForce)) {
    return velocity;
  }

  velocity += appliedForce;

  // =-=-=
  // apply different physics drags in different liquids/blocks/etc
  // =-=-=

  // this applies a lot of drag - helps us slow down fast
  velocity *= Config.physics.base_drag;
  if (
    // if we have vertical gravitational pull AND we're not moving
    // when would we want both conditions?
    // (self.modY) ||: the drag would ALWAYS be applied (when in air blocks)
    //                 making it really hard to move left/right
    // (!movementX) ||: when there's no vertitcal pull (like on dots),
    //                  the player has just as much grip as when they're on land
    //                  this makes dots not slippery
    (!axisMovement && crossAxisGravity) ||
    // OR we're going left and want to go right
    // why do we want this? to be able to make hard left->right turns
    (velocity < 0 && axisMovement > 0) ||
    // OR we're going right and want to go left
    // why do we want this? to be able to make hard right->left turns
    (velocity > 0 && axisMovement < 0)
  ) {
    velocity *= Config.physics.no_modifier_drag;
  }

  // clamping speed
  // 16 is the maximum speed allowed before we start phasing through blocks
  if (velocity > 16) {
    velocity = 16;
  } else if (velocity < -16) {
    velocity = -16;
  } else if (Math.abs(velocity) < 0.0001) {
    velocity = 0;
  }

  return velocity;
}
