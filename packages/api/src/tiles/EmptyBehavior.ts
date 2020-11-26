import { TileLayer, ZTileJson } from "../types";
import Behavior from "./Behavior";
import TileRegistration from "./TileRegistration";

export default class EmptyBehavior extends Behavior<[]> {
  constructor(_: ZTileJson, registration: TileRegistration) {
    // saying "foreground" doesn't really matter here for empty
    super(_, "empty", TileLayer.Foreground);

    const id = registration.register(this, 0);
    if (id !== 0) throw new Error("empty tile gets id 0");

    this.texture.set(id, "empty");
  }

  default(): number {
    return 0;
  }

  next(): number {
    return 0;
  }

  serialize(): [] {
    return [];
  }

  deserialize(): number {
    return 0;
  }
}
