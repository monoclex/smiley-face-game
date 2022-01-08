import { TileLayer, ZTileJson, Rotation } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";

export default class ZoostBehavior<S> extends Behavior<[S, Rotation]> {
  readonly zoosts: [number, number, number, number];

  constructor(tileJson: ZTileJson, registration: TileRegistration, readonly sourceId: S) {
    super(tileJson, "zoost", TileLayer.Action);
    if (tileJson.behavior !== "zoost") throw new Error("passed non-gun tile json to gun behavior");

    this.zoosts = [registration.register(this), registration.register(this), registration.register(this), registration.register(this)];

    this.texture.set(this.zoosts[0], "zoost-up");
    this.texture.set(this.zoosts[1], "zoost-right");
    this.texture.set(this.zoosts[2], "zoost-down");
    this.texture.set(this.zoosts[3], "zoost-left");
  }

  default(): number {
    return this.zoosts[0];
  }

  next(current: number): number {
    if (current === this.zoosts[3]) {
      return this.zoosts[0];
    }

    return current + 1;
  }

  serialize(id: number): [S, Rotation] {
    if (id === this.zoosts[0]) return [this.sourceId, Rotation.Up];
    if (id === this.zoosts[1]) return [this.sourceId, Rotation.Right];
    if (id === this.zoosts[2]) return [this.sourceId, Rotation.Down];
    if (id === this.zoosts[3]) return [this.sourceId, Rotation.Left];
    throw new Error("invalid id");
  }

  deserialize([mainId, rotation]: [S, Rotation]): number {
    if (mainId !== this.sourceId) throw new Error("mainId isn't right");
    if (rotation === Rotation.Up) return this.zoosts[0];
    if (rotation === Rotation.Right) return this.zoosts[1];
    if (rotation === Rotation.Down) return this.zoosts[2];
    if (rotation === Rotation.Left) return this.zoosts[3];
    throw new Error("invalid rotation");
  }
}
