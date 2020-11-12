import type Behavior from "./Behavior";

export default class TileRegistration {
  _current: number = 1; /* we start at `1` because the empty tile (0) is king */
  _map: Map<number, Behavior<unknown>> = new Map();

  register(instance: Behavior<unknown>, argId?: number): number {
    const id = !!argId ? argId : this._current++;
    this._map.set(id, instance);
    return id;
  }

  for(id: number): Behavior<unknown> {
    const behavior = this._map.get(id);
    if (behavior === undefined) {
      throw new Error("Attempted to get registration for " + id + ", found none.");
    }
    return behavior;
  }

  texture(id: number): string {
    return this.for(id).texture.get(id)!;
  }

  id(texture: string): number {
    for (const id of this._map.keys()) {
      if (this.texture(id) === texture) return id;
    }
    throw new Error("couldn't find id for texture " + texture);
  }
}
