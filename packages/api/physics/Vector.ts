export class Vector {
  static readonly Zero: Vector = new Vector(0, 0);
  static readonly Up: Vector = new Vector(0, -1);
  static readonly Down: Vector = new Vector(0, 1);
  static readonly Right: Vector = new Vector(1, 0);
  static readonly Left: Vector = new Vector(-1, 0);

  static newScalar(scalar: number) {
    return new Vector(scalar, scalar);
  }

  static mutateX(vector: Vector, x: number): Vector {
    return new Vector(x, vector.y);
  }

  static mutateY(vector: Vector, y: number): Vector {
    return new Vector(vector.x, y);
  }

  constructor(readonly x: number, readonly y: number) {}

  static add(self: Vector, b: Vector): Vector {
    return new Vector(self.x + b.x, self.y + b.y);
  }

  static adds(self: Vector, scalar: number): Vector {
    return new Vector(self.x + scalar, self.y + scalar);
  }

  static sub(self: Vector, other: Vector): Vector {
    return new Vector(self.x - other.x, self.y - other.y);
  }

  static subs(self: Vector, scalar: number): Vector {
    return new Vector(self.x - scalar, self.y - scalar);
  }

  static mult(self: Vector, other: Vector): Vector {
    return new Vector(self.x * other.x, self.y * other.y);
  }

  static mults(self: Vector, scalar: number): Vector {
    return new Vector(self.x * scalar, self.y * scalar);
  }

  static div(self: Vector, other: Vector): Vector {
    return new Vector(self.x / other.x, self.y / other.y);
  }

  static divs(self: Vector, scalar: number): Vector {
    return new Vector(self.x / scalar, self.y / scalar);
  }
}
