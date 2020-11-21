import World from "../../game/world/World";
import { blockbar } from "../../recoil/atoms/blockbar";
import type { ZBlock } from "@smiley-face-game/api/types";

export default class BlockBar {
  constructor(world: World) {
    blockbar.modify({ loader: world.tileManager.imageOf.bind(world.tileManager) });
  }

  get selectedBlock(): ZBlock {
    return blockbar.state.slots[blockbar.state.selected];
  }
}
