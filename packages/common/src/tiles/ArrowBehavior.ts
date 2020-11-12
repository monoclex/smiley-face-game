import type { ZTileJson } from "../types";
import { Rotation } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";

export default class ArrowBehavior extends Behavior<[2, Rotation]> {
  readonly arrows: [number, number, number, number];

  constructor(tileJson: ZTileJson, registration: TileRegistration) {
    super(tileJson);
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

  serialize(id: number): [2, Rotation] {
    if (id === this.arrows[0]) return [2, Rotation.Up];
    if (id === this.arrows[1]) return [2, Rotation.Right];
    if (id === this.arrows[2]) return [2, Rotation.Down];
    if (id === this.arrows[3]) return [2, Rotation.Left];
    throw new Error("invalid id");
  }

  deserialize([_, rotation]: [2, Rotation]): number {
    if (rotation === Rotation.Up) return this.arrows[0];
    if (rotation === Rotation.Right) return this.arrows[1];
    if (rotation === Rotation.Down) return this.arrows[2];
    if (rotation === Rotation.Left) return this.arrows[3];
    throw new Error("invalid rotation");
  }
}