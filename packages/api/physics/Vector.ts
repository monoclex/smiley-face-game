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

  static negate(v: Vector): Vector {
    return new Vector(-v.x, -v.y);
  }

  static swap(v: Vector): Vector {
    return new Vector(v.y, v.x);
  }

  /**
   * Opposite of `filterIn`
   *
   * Given a predicate vector, filters out values from the value vector.
   *
   * For both X and Y components:
   *
   * - If the predicate component is falsy (0), the value component is used
   * - If the predicate component is truthy (not 0), the value `0` is used
   *
   * ```
   * filterOut(        0, value) = value
   * filterOut(predicate, value) = 0
   * ```
   *
   * @param predicate The vector which uses zeros to determine pass-through
   * @param value The value vector to filter values out of
   * @returns A vector, such that any zeros present in the predicate vector are
   * replaced by values in the value vector, and any non-zeros are replaced by zeros.
   */
  static filterOut(predicate: Vector, value: Vector): Vector {
    return new Vector(predicate.x === 0 ? value.x : 0, predicate.y === 0 ? value.y : 0);
  }

  /**
   * Opposite of `filterOut`
   *
   * Given a predicate vector, filters values in from the value vector.
   *
   * For both X and Y components:
   *
   * - If the predicate component is falsy (0), the value `0` is used is used
   * - If the predicate component is truthy (not 0), the value component is used
   *
   * ```
   * filterIn(        0, value) = 0
   * filterIn(predicate, value) = value
   * ```
   *
   * @param predicate The vector which uses zeros to determine pass-through
   * @param value The value vector to filter values in to
   * @returns A vector, such that any zeros present in the predicate vector are
   * kept, and any non-zeros are replaced by values in the value vector.
   */
  static filterIn(predicate: Vector, value: Vector): Vector {
    return new Vector(predicate.x === 0 ? 0 : value.x, predicate.y === 0 ? 0 : value.y);
  }

  /**
   * Replaces zeros in `zeroful` with values in `substitute`.
   *
   * ```
   * substituteZeros(      0, substitute) = substitute
   * substituteZeros(zeroful, substitute) = zeroful
   * ```
   *
   * @param zeroful The vector whose zeros should be replaced by values in `replacement`
   * @param substitute The vector whoze values replace zeros in `zerofull`
   * @returns A vector where the zeros of `zerofull` are substituted by `replacement`
   */
  static substituteZeros(zeroful: Vector, substitute: Vector): Vector {
    return new Vector(
      zeroful.x === 0 ? substitute.x : zeroful.x,
      zeroful.y === 0 ? substitute.y : zeroful.y
    );
  }

  static call(func: (...args: number[]) => number, ...args: Vector[]): Vector {
    return new Vector(func(...args.map((v) => v.x)), func(...args.map((v) => v.y)));
  }
}
