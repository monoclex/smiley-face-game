import { TileId } from "@smiley-face-game/api/schemas/TileId";

import World from "@/game/world/World";
import { blockbar } from "@/recoil/atoms/blockbar";
import TileState from "@/game/tiles/TileState";

export default class BlockBar {
  constructor(world: World) {
    blockbar.modify({ loader: world.tileManager.imageOf.bind(world.tileManager) });
  }

  get selectedBlock(): TileState {
    return blockbar.state.slots[blockbar.state.selected];
  }
}
