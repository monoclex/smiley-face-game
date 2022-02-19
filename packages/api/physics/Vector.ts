export class Vector {
  static readonly Zero: Vector = new Vector(0, 0);
  static readonly Up: Vector = new Vector(0, -1);
  static readonly Down: Vector = new Vector(0, 1);
  static readonly Right: Vector = new Vector(1, 0);
  static readonly Left: Vector = new Vector(-1, 0);

  // just holding the static value "1, 1".
  // could probably replace it later
  static readonly SPAWN_LOCATION: Vector = new Vector(1, 1);

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

  // the `s` suffix stands for scalar

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

  static eq(self: Vector, other: Vector): boolean {
    return self.x === other.x && self.y === other.y;
  }

  static floor(self: Vector): Vector {
    return new Vector(Math.floor(self.x), Math.floor(self.y));
  }

  static round(self: Vector): Vector {
    return new Vector(Math.round(self.x), Math.round(self.y));
  }

  /**
   * Given a predicate vector, filters out values form the value vector.
   *
   * For example, consider the filter operator to be called `|>`:
   *
   * ```
   * (0, 0) |> (1, 2) = (1, 2)
   * (1, 0) |> (1, 2) = (0, 2)
   * (0, 1) |> (1, 2) = (1, 0)
   * (1, 1) |> (1, 2) = (0, 0)
   * ```
   *
   * More generally,
   *
   * ```
   * (p_1, p_2, ..., p_n) |> (v_1, v_2, ... v_n) = (F(p_1, v_1), F(p_2, v_2), ..., F(p_n, v_n))
   * ```
   *
   * where
   *
   * ```
   * F(0, b) = b
   * F(a, b) = 0
   * ```
   *
   * @param predicate The vector which uses zeros to determine pass-through
   * @param value The value vector to filter values out of
   * @returns A vector, such that any zeros present in the predicate vector are
   * present in the resultant vector, and any non-zeros are replaced by values
   * in the value vector.
   */
  static filter(predicate: Vector, value: Vector): Vector {
    return new Vector(predicate.x === 0 ? value.x : 0, predicate.y === 0 ? value.y : 0);
  }
}
