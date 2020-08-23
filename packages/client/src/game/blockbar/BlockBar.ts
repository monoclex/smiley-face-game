import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { supplyTextureLoader } from "@/ui/redux/actionCreators/blockBar";
import store from "@/ui/redux/store";
import World from "@/game/world/World";

export default class BlockBar {
  constructor(world: World) {
    supplyTextureLoader(world.tileManager.imageOf.bind(world.tileManager))(store.dispatch, () => store.getState().blockBar, null);
  }

  get selectedBlock(): TileId {
    const reduxBar = store.getState().blockBar;
    return reduxBar.slots[reduxBar.selected ?? 1];
  }
}
