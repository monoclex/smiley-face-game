import type { ZTileJson } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";

export default class GunBehavior extends Behavior<[1, number]> {
  readonly gunId: number;

  constructor(tileJson: ZTileJson, registration: TileRegistration) {
    super(tileJson);
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

  serialize(): [1, number] {
    // TODO: when there are more gun types, add them as additional variants
    return [1, 0];
  }

  deserialize([_, gunType]: [1, number]): number {
    if (gunType !== 0) throw new Error("multiple gun variants aren't supported at this time");
    return this.gunId;
  }
}