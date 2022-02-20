import { Vector } from "./Vector";

export class Rectangle {
  constructor(readonly position: Vector, readonly size: Vector) {}

  static overlaps(a: Rectangle, b: Rectangle): boolean {
    // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    const overlaps = Vector.and(
      Vector.ltv(a.position, Vector.add(b.position, b.size)),
      Vector.gtv(Vector.add(a.position, a.size), b.position)
    );

    return overlaps.x && overlaps.y;
  }
}
