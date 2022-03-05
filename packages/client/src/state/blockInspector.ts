import { Vector } from "@smiley-face-game/api/physics/Vector";
import { atom, selector } from "recoil";
import SharedGlobal from "./SharedGlobal";

const defaultBlockInspectorState: BlockInspectorState = {
  enabled: false,
  visible: false,
  x: 0,
  y: 0,
  screenX: 0,
  screenY: 0,
};

interface BlockInspectorState {
  enabled: boolean;
  visible: boolean;
  x: number;
  y: number;
  screenX: number;
  screenY: number;
}
export const blockInspectorGlobal = new SharedGlobal<BlockInspectorState>(
  defaultBlockInspectorState
);

export const blockInspectorState = atom<BlockInspectorState>({
  key: "blockInspectorState",
  default: defaultBlockInspectorState,
  effects: [blockInspectorGlobal.initialize],
});

export const blockPositionSelector = selector<Vector>({
  key: "blockPositionSelector",
  get: ({ get }) => {
    const { x, y } = get(blockInspectorState);
    return { x, y };
  },
});
