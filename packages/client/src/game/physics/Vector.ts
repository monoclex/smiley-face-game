export default class Vector {
  static readonly Up: Vector = new Vector(0, -1);
  static readonly Down: Vector = new Vector(0, 1);
  static readonly Right: Vector = new Vector(1, 0);
  static readonly Left: Vector = new Vector(-1, 0);

  constructor(readonly x: number, readonly y: number) {}

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  sub(other: Vector): Vector {
    return this.add(other.mults(-1));
  }

  mults(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  mult(other: Vector): Vector {
    return new Vector(this.x * other.x, this.y * other.y);
  }
}
