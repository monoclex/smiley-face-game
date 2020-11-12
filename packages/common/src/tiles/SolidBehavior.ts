import type { ZTileJson } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";

export default class SolidBehavior extends Behavior<[0, number]> {
  private _idToName: Map<number, string> = new Map();
  private _numerics: Map<number, number> = new Map();
  private _start?: number;
  private _end?: number;

  constructor(tileJson: ZTileJson, registration: TileRegistration) {
    super(tileJson);
    if (tileJson.behavior !== "solid") throw new Error("passed non-solid tile json to solid behavior");

    if (tileJson.numerics) throw new Error("`numerics` isn't supported at this time, i haven't coded support for 'em yet");

    let lastId: number | undefined = undefined;
    let i = 0;
    for (const tile of tileJson.tiles) {
      const id = registration.register(this);

      this._idToName.set(id, tile);
      this.texture.set(id, `${tileJson.name}-${tile}`);
      this._numerics.set(id, i);

      lastId = id;
      if (!this._start) this._start = id;
      i++;
    }

    if (lastId === undefined) throw new Error("err: tile json had no tiles in it");

    this._end = lastId;
  }

  default(): number {
    return this._start!;
  }

  next(current: number): number {
    let next = current + 1;
    if (next > this._end!) return this._start!;
    return next;
  }

  serialize(id: number): [0, number] {
    return [0, this._numerics.get(id)!];
  }

  deserialize([_, tile]: [0, number]): number {
    for (const [id, numeric] of this._numerics.entries()) {
      if (numeric === tile) return id;
    }
    throw new Error("unable to deserialize");
  }
}