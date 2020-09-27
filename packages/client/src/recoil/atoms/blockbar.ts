import { atom } from "recoil";
import SharedGlobal from "@/recoil/SharedGlobal";
import { SlotId, SelectedSlotId } from "@/client/Slot";
import { TileId } from "@smiley-face-game/api/schemas/TileId";

export interface BlockBar {
  selected: SlotId;
  slots: {[key in SelectedSlotId]: TileId};
  loader: null | ((tileId: TileId) => Promise<HTMLImageElement>);
}

export const defaultBlockbarState: BlockBar = {
  selected: 1,
  loader: null,
  slots: {
    [ 0]: TileId.Empty,
    [ 1]: TileId.Full,
    [ 2]: TileId.Gun,
    [ 3]: TileId.Arrow,
    [ 4]: TileId.Empty,
    [ 5]: TileId.Empty,
    [ 6]: TileId.Empty,
    [ 7]: TileId.Empty,
    [ 8]: TileId.Empty,
    [ 9]: TileId.Empty,
    [10]: TileId.Empty,
    [11]: TileId.Empty,
    [12]: TileId.Empty,
  }
};
export const blockbar = new SharedGlobal<BlockBar>(defaultBlockbarState);
export const blockbarState = atom<BlockBar>({
  key: "blockbarState",
  default: defaultBlockbarState,
  //@ts-ignore
  effects_UNSTABLE: [blockbar.initialize],
});
