import { TileLayer, ZTileJson, Rotation } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";

export default class BoostBehavior<S> extends Behavior<[S, Rotation]> {
  readonly boosts: [number, number, number, number];

  constructor(tileJson: ZTileJson, registration: TileRegistration, readonly sourceId: S) {
    super(tileJson, "boost", TileLayer.Action);
    if (tileJson.behavior !== "boost") throw new Error("passed non-gun tile json to gun behavior");

    this.boosts = [registration.register(this), registration.register(this), registration.register(this), registration.register(this)];

    this.texture.set(this.boosts[0], "boost-up");
    this.texture.set(this.boosts[1], "boost-right");
    this.texture.set(this.boosts[2], "boost-down");
    this.texture.set(this.boosts[3], "boost-left");
  }

  default(): number {
    return this.boosts[0];
  }

  next(current: number): number {
    if (current === this.boosts[3]) {
      return this.boosts[0];
    }

    return current + 1;
  }

  serialize(id: number): [S, Rotation] {
    if (id === this.boosts[0]) return [this.sourceId, Rotation.Up];
    if (id === this.boosts[1]) return [this.sourceId, Rotation.Right];
    if (id === this.boosts[2]) return [this.sourceId, Rotation.Down];
    if (id === this.boosts[3]) return [this.sourceId, Rotation.Left];
    throw new Error("invalid id");
  }

  deserialize([mainId, rotation]: [S, Rotation]): number {
    if (mainId !== this.sourceId) throw new Error("mainId isn't right");
    if (rotation === Rotation.Up) return this.boosts[0];
    if (rotation === Rotation.Right) return this.boosts[1];
    if (rotation === Rotation.Down) return this.boosts[2];
    if (rotation === Rotation.Left) return this.boosts[3];
    throw new Error("invalid rotation");
  }
}
