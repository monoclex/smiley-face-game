import { atom } from "recoil";
import SharedGlobal from "../../recoil/SharedGlobal";
import { SelectedSlotId } from "../../client/Slot";
import type { ZBlock } from "@smiley-face-game/common/types";

export interface BlockBar {
  selected: SelectedSlotId;
  slots: { [key in SelectedSlotId]: ZBlock };
  loader: null | ((tileState: ZBlock) => Promise<HTMLImageElement>);
}

export const defaultBlockbarState: BlockBar = {
  selected: 1,
  loader: null,
  slots: {
    [0]: 0,
    [1]: 0,
    [2]: 0,
    [3]: 0,
    [4]: 0,
    [5]: 0,
    [6]: 0,
    [7]: 0,
    [8]: 0,
    [9]: 0,
    [10]: 0,
    [11]: 0,
    [12]: 0,
  },
};
export const blockbar = new SharedGlobal<BlockBar>(defaultBlockbarState);
export const blockbarState = atom<BlockBar>({
  key: "blockbarState",
  default: defaultBlockbarState,
  //@ts-ignore
  effects_UNSTABLE: [blockbar.initialize],
});
