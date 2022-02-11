const undef = (x: unknown) => x === null || x === undefined;

/**
 * Stores a two dimensional lazily-loaded grid.
 * Relies upon `T` never being null or undefined.
 */
export class WorldLayer<T> {
  // state: T[][][] = [];

  _real: T[][][] = [];

  get state(): T[][][] {
    return this._real;
  }

  set state(x) {
    this._real = x;
    this.sanitize();
  }

  constructor(private readonly factory: T) {}

  get(layer: number, x: number, y: number): T {
    const ys = this.getYsSafe(layer, y, x);

    let elem = ys[x];

    if (undef(elem)) {
      ys[x] = elem = this.factory;
    }

    return elem;
  }

  set(layer: number, x: number, y: number, it: T) {
    const ys = this.getYsSafe(layer, y, x);
    ys[x] = it;
  }

  sanitize() {
    for (let layerIdx = 0; layerIdx < this._real.length; layerIdx++) {
      const layer = this._real[layerIdx];
      if (undef(layer)) {
        this._real[layerIdx] = [];
        continue;
      }

      for (let y = 0; y < layer.length; y++) {
        const ys = layer[y];
        if (undef(ys)) {
          layer[y] = [];
          continue;
        }

        for (let x = 0; x < ys.length; x++) {
          if (undef(ys[x])) {
            ys[x] = this.factory;
          }
        }
      }
    }
  }

  /**
   * Because `state` could be empty, this will perform all the necessary checks
   * to create or update a value in the grid.
   */
  private getYsSafe(layer: number, y: number, x: number) {
    const arrLayer = WorldLayer.layer(this.state, layer);
    const ys = WorldLayer.ys(arrLayer, y);

    for (let xIdx = 0; xIdx < Math.max(x, ys.length); xIdx++) {
      if (undef(ys[xIdx])) {
        ys[xIdx] = this.factory;
      }
    }
    return ys;
  }

  static layer<T>(world: T[][][], layer: number): T[][] {
    let arr = world[layer];
    if (undef(arr)) {
      world[layer] = arr = [];
    }

    for (let layerIdx = 0; layerIdx < layer; layerIdx++) {
      if (undef(world[layerIdx])) {
        world[layerIdx] = [];
      }
    }

    return arr;
  }

  static ys<T>(layer: T[][], y: number): T[] {
    let arr = layer[y];

    if (undef(arr)) {
      layer[y] = arr = [];
    }

    for (let yIdx = 0; yIdx < layer.length; yIdx++) {
      if (undef(layer[yIdx])) {
        layer[yIdx] = [];
      }
    }

    return arr;
  }
}
