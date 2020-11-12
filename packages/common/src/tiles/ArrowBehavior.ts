import { TileLayer, ZTileJson } from "../types";
import { Rotation } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";

export default class ArrowBehavior<S> extends Behavior<[S, Rotation]> {
  readonly arrows: [number, number, number, number];

  constructor(tileJson: ZTileJson, readonly sourceId: S, registration: TileRegistration) {
    super(tileJson, "arrow", TileLayer.Action);
    if (tileJson.behavior !== "arrow") throw new Error("passed non-gun tile json to gun behavior");

    this.arrows = [
      registration.register(this),
      registration.register(this),
      registration.register(this),
      registration.register(this)
    ];

    this.texture.set(this.arrows[0], "arrow-up");
    this.texture.set(this.arrows[1], "arrow-right");
    this.texture.set(this.arrows[2], "arrow-down");
    this.texture.set(this.arrows[3], "arrow-left");
  }

  default(): number {
    return this.arrows[0];
  }

  next(current: number): number {
    if (current === this.arrows[3]) {
      return this.arrows[0];
    }

    return current + 1;
  }

  serialize(id: number): [S, Rotation] {
    if (id === this.arrows[0]) return [this.sourceId, Rotation.Up];
    if (id === this.arrows[1]) return [this.sourceId, Rotation.Right];
    if (id === this.arrows[2]) return [this.sourceId, Rotation.Down];
    if (id === this.arrows[3]) return [this.sourceId, Rotation.Left];
    throw new Error("invalid id");
  }

  deserialize([mainId, rotation]: [S, Rotation]): number {
    if (mainId !== this.sourceId) throw new Error("mainId isn't right");
    if (rotation === Rotation.Up) return this.arrows[0];
    if (rotation === Rotation.Right) return this.arrows[1];
    if (rotation === Rotation.Down) return this.arrows[2];
    if (rotation === Rotation.Left) return this.arrows[3];
    throw new Error("invalid rotation");
  }
}