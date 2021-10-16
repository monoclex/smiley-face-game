import { TileLayer, ZTileJson } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";

export default class GunBehavior<S extends number> extends Behavior<[S, number]> {
  readonly gunId: number;

  constructor(tileJson: ZTileJson, registration: TileRegistration, readonly sourceId: S) {
    super(tileJson, "gun", TileLayer.Action);
    if (tileJson.behavior !== "gun") throw new Error("passed non-gun tile json to gun behavior");

    this.gunId = registration.register(this);
    this.texture.set(this.gunId, "gun");
  }

  default(): number {
    return this.gunId;
  }

  next(): number {
    return this.gunId;
  }

  serialize(): [S, number] {
    // TODO: when there are more gun types, add them as additional variants
    return [this.sourceId, 0];
  }

  deserialize([mainId, gunType]: [S, number]): number {
    if ((mainId as unknown) !== this.sourceId) throw new Error("mainId isn't right");
    if (gunType !== 0) throw new Error("multiple gun variants aren't supported at this time");
    return this.gunId;
  }
}
