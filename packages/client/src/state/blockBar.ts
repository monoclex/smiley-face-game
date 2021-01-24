import { atom } from "recoil";
import type { ZBlock } from "@smiley-face-game/api/src/types";
import { SelectedSlotId } from "../client/Slot";
import SharedGlobal from "./SharedGlobal";

interface BlockBar {
  selected: SelectedSlotId;
  slots: { [key in SelectedSlotId]: ZBlock };
}

const defaultBlockbarState: BlockBar = {
  selected: 1,
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

export const blockBarGlobal = new SharedGlobal<BlockBar>(defaultBlockbarState);

export const blockBarState = atom<BlockBar>({
  key: "blockBarState",
  default: defaultBlockbarState,
  //@ts-ignore
  effects_UNSTABLE: [blockBarGlobal.initialize],
});
