import type { ZTileJson } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";
import { TileLayer } from "../types";

const panic = () => {
  throw new Error("unexpected");
};

enum KeyBehaviorKind {
  Key = 0,
  Door = 1,
  Gate = 2,
}

export default class KeysBehavior<S extends number> extends Behavior<[S, number, number]> {
  private _idToName: Map<number, string> = new Map();
  private _numerics: Map<number, [KeyBehaviorKind, number]> = new Map();
  private _start?: number;
  private _end?: number;

  constructor(tileJson: ZTileJson, registration: TileRegistration, readonly sourceId: S) {
    super(tileJson, "keys", TileLayer.Foreground);
    if (tileJson.behavior !== "keys") throw new Error("passed non-solid tile json to solid behavior");

    let lastId: number | undefined = undefined;
    let i = 0;

    const register = (behavior: this, tile: string, kind: KeyBehaviorKind) => {
      const id = registration.register(behavior);

      behavior._idToName.set(id, tile);
      behavior.texture.set(id, `${tileJson.name}-${tile}`);
      behavior._numerics.set(id, [kind, i]);

      lastId = id;
      if (!behavior._start) behavior._start = id;
      i++;
    };

    for (const tile of tileJson.tiles) {
      register(this, `${tile}-key`, KeyBehaviorKind.Key);
      register(this, `${tile}-door`, KeyBehaviorKind.Door);
      register(this, `${tile}-gate`, KeyBehaviorKind.Gate);
    }

    if (lastId === undefined) throw new Error("err: tile json had no tiles in it");

    this._end = lastId;
  }

  default(): number {
    return this._start ?? panic();
  }

  next(current: number): number {
    const next = current + 1;
    if (next > (this._end ?? panic())) return this._start ?? panic();
    return next;
  }

  serialize(id: number): [S, number, number] {
    return [this.sourceId, ...(this._numerics.get(id) ?? panic())];
  }

  deserialize([mainId, kind, tile]: [S, number, number]): number {
    if (mainId !== this.sourceId) throw new Error("mainId isn't right");
    for (const [id, [entryKind, entryTile]] of this._numerics.entries()) {
      if (entryKind === kind && entryTile === tile) return id;
    }
    throw new Error("unable to deserialize");
  }
}
