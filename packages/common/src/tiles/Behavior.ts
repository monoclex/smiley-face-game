import type { ZTileBehavior, ZTileJson, TileLayer } from "../types";
import { zTileJson } from "../types";

export default abstract class Behavior<T> {
  readonly texture: Map<number, string> = new Map();

  constructor(tileJson: ZTileJson, readonly behavior: ZTileBehavior, readonly layer: TileLayer) {
    // children will call `super()` so we can catch last minute invalid payloads if we want here
    zTileJson.parse(tileJson);
  }

  /** Gets the Id of the default state of this tile */
  abstract default(): number;

  /** Given the current id, will produce the next id of this tile. Will wrap around if at the end. */
  abstract next(current: number): number;

  /** Given the current id, will turn it into some payload that can always be deserialized back into the id later */
  abstract serialize(id: number): T;

  /** Deserializes a serialized payload back into its id. */
  abstract deserialize(payload: T): number;
}
