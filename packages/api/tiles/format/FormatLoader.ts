import { WorldLayer } from "../../game/WorldLayer";
import { ZHeap } from "../../types";
import TileRegistration from "../TileRegistration";

export class FormatLoader {
  readonly world: WorldLayer<number> = new WorldLayer(0);
  readonly heap: WorldLayer<ZHeap | 0> = new WorldLayer(0);

  constructor(readonly tiles: TileRegistration) {}
}
