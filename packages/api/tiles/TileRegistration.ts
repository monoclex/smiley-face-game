import type Behavior from "./Behavior";

export default class TileRegistration {
  _current = 1; /* we start at `1` because the empty tile (0) is king */
  _map: Map<number, Behavior<unknown>> = new Map();
  _sources: Map<number, Behavior<unknown>> = new Map();

  register(instance: Behavior<unknown>, argId?: number | undefined): number {
    const id = argId !== undefined ? argId : this._current++;
    this._map.set(id, instance);
    return id;
  }

  registerSrc(instance: Behavior<unknown>, sourceId: number) {
    this._sources.set(sourceId, instance);
  }

  for(id: number | string): Behavior<unknown> {
    if (typeof id === "string") return this.for(this.id(id));

    const behavior = this._map.get(id);
    if (behavior === undefined) {
      throw new Error("Attempted to get registration for " + id + ", found none.");
    }
    return behavior;
  }

  texture(id: number): string {
    const texture = this.for(id).texture.get(id);
    if (texture == undefined) throw new Error("could not get texture for " + id);
    return texture;
  }

  id(texture: string): number {
    for (const id of this._map.keys()) {
      if (this.texture(id) === texture) return id;
    }
    throw new Error("couldn't find id for texture " + texture);
  }

  forSrc(id: number): Behavior<unknown> {
    const behavior = this._sources.get(id);
    if (behavior === undefined) {
      throw new Error("couldn't get registration for source " + id);
    }
    return behavior;
  }
}
