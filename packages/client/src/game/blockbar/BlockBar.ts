import { TileId } from "@smiley-face-game/api/schemas/TileId";

import World from "@/game/world/World";

export default class BlockBar {
  constructor(world: World) {}

  get selectedBlock(): TileId {
    return TileId.Full;
  }
}
