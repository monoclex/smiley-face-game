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

  static pointInside(rectangle: Rectangle, point: Vector) {
    const inside = Vector.and(
      Vector.gev(point, rectangle.position),
      Vector.lev(point, Vector.add(rectangle.position, rectangle.size))
    );

    return inside.x && inside.y;
  }

  static mults(rectangle: Rectangle, scalar: number): Rectangle {
    return new Rectangle(
      Vector.mults(rectangle.position, scalar),
      Vector.mults(rectangle.size, scalar)
    );
  }
}
