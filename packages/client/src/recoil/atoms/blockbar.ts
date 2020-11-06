import { atom } from "recoil";
import SharedGlobal from "../../recoil/SharedGlobal";
import { SelectedSlotId } from "../../client/Slot";
import { TileId } from "@smiley-face-game/common/types";
import type { ZBlock } from "@smiley-face-game/common/types";
import { defaultFor } from "@smiley-face-game/common/tiles/TileState";

export interface BlockBar {
  selected: SelectedSlotId;
  slots: { [key in SelectedSlotId]: ZBlock };
  loader: null | ((tileState: ZBlock) => Promise<HTMLImageElement>);
}

export const defaultBlockbarState: BlockBar = {
  selected: 1,
  loader: null,
  slots: {
    [0]: defaultFor(TileId.Empty),
    [1]: defaultFor(TileId.Basic),
    [2]: defaultFor(TileId.Gun),
    [3]: defaultFor(TileId.Arrow),
    [4]: defaultFor(TileId.Prismarine),
    [5]: defaultFor(TileId.Empty),
    [6]: defaultFor(TileId.Empty),
    [7]: defaultFor(TileId.Empty),
    [8]: defaultFor(TileId.Empty),
    [9]: defaultFor(TileId.Empty),
    [10]: defaultFor(TileId.Empty),
    [11]: defaultFor(TileId.Empty),
    [12]: defaultFor(TileId.Empty),
  },
};
export const blockbar = new SharedGlobal<BlockBar>(defaultBlockbarState);
export const blockbarState = atom<BlockBar>({
  key: "blockbarState",
  default: defaultBlockbarState,
  //@ts-ignore
  effects_UNSTABLE: [blockbar.initialize],
});
