import clamp from "../clamp";
import { Vector } from "../Vector";
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
  velocity += appliedForce;

  if (velocity == 0) {
    return 0;
  }

  velocity *= Config.physics.base_drag;

  const isFalling = !axisMovement && crossAxisGravity;
  const makingHardLeftToRightTurn = velocity < 0 && axisMovement > 0;
  const makingHardRightToleftTurn = velocity > 0 && axisMovement < 0;

  if (isFalling || makingHardLeftToRightTurn || makingHardRightToleftTurn) {
    // apply a lot of drag to make it easier to turn
    velocity *= Config.physics.no_modifier_drag;
  }

  velocity = clamp(velocity, -16, 16);

  if (Math.abs(velocity) < 0.0001) {
    velocity = 0;
  }

  return velocity;
}
