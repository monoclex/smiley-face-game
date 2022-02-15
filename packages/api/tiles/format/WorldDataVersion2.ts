import { TileLayer } from "../..";
import { WorldLayer } from "../../game/WorldLayer";
import { zHeap } from "../../types";
import { HeapKind } from "../register";
import { FormatLoader } from "./FormatLoader";

type Block = number | [number, any];

export function loadWorldVersion2(loader: FormatLoader, blocks: Block[][][]) {
  for (let layerIdx = 0; layerIdx < blocks.length; layerIdx++) {
    const layer = blocks[layerIdx];
    if (!layer) continue;

    for (let y = 0; y < layer.length; y++) {
      const ys = layer[y];
      if (!ys) continue;

      for (let x = 0; x < ys.length; x++) {
        const block = ys[x];

        if (typeof block === "number") loader.world.set(layerIdx, x, y, block);
        else if (block.length === 2) {
          const [id, heap] = block;

          const heapData = zHeap.parse(heap);
          loader.world.set(layerIdx, x, y, id);
          loader.heap.set(layerIdx, x, y, heapData);
        }
      }
    }
  }
}

export function saveWorldVersion2(loader: FormatLoader): Block[][][] {
  const state = new WorldLayer<Block>(0);

  for (let layerIdx = TileLayer.Foreground; layerIdx < TileLayer.Decoration; layerIdx++) {
    const layer = loader.world.state[layerIdx];
    if (!layer) continue;

    for (let y = 0; y < layer.length; y++) {
      const ys = layer[y];
      if (!ys) continue;

      for (let x = 0; x < ys.length; x++) {
        const block = ys[x];

        const blockInfo = loader.tiles.forId(block);

        if (blockInfo.heap == HeapKind.None) {
          state.set(layerIdx, x, y, block);
        } else {
          state.set(layerIdx, x, y, [block, loader.heap.get(layerIdx, x, y)]);
        }
      }
    }
  }

  return state.state;
}
