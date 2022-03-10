import { WorldLayer } from "../../game/WorldLayer";
import { Vector } from "../../physics/Vector";
import { ZHeap } from "../../types";
import TileRegistration from "../TileRegistration";

export class FormatLoader {
  world: WorldLayer<number> = new WorldLayer(0);
  heap: WorldLayer<ZHeap | 0> = new WorldLayer(0);

  constructor(readonly tiles: TileRegistration, readonly size: Vector) {}
}
