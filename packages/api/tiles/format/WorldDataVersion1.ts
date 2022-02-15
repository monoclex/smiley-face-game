import { FormatLoader } from "./FormatLoader";

type Block =
  | null
  | undefined
  | []
  | BasicBlock
  | GunBlock
  | ArrowBlock
  | PrismarineBlock
  | GemstoneBlock
  | TShellBlock
  | PyramidBlock
  | ChocolateBlock
  | BoostBlock
  | KeysBlock
  | ZoostBlock
  | SignBlock
  | SpikesPack;

type BasicBlock =
  | [0, 0]
  | [0, 1]
  | [0, 2]
  | [0, 3]
  | [0, 4]
  | [0, 5]
  | [0, 6]
  | [0, 7]
  | [0, 8]
  | [0, 9];

const basicVariantMap = {
  [0]: "white",
  [1]: "brown",
  [2]: "black",
  [3]: "red",
  [4]: "orange",
  [5]: "yellow",
  [6]: "green",
  [7]: "aqua",
  [8]: "blue",
  [9]: "purple",
};

type GunBlock = [1, 0];

const gunVariantMap = {
  [0]: "[REPLACE]gun",
};

type ArrowBlock = [2, 0] | [2, 1] | [2, 2] | [2, 3] | [2, 4];

const arrowVariantMap = {
  [0]: "up",
  [1]: "right",
  [2]: "down",
  [3]: "left",
  [4]: "[REPLACE]dot",
};

type PrismarineBlock = [3, 0] | [3, 1] | [3, 2] | [3, 3] | [3, 4];

const prismarineVariantMap = {
  [0]: "basic",
  [1]: "anchor",
  [2]: "brick",
  [3]: "slab",
  [4]: "crystal",
};

type GemstoneBlock = [4, 0] | [4, 1] | [4, 2] | [4, 3] | [4, 4] | [4, 5] | [4, 6] | [4, 7];

const gemstoneVariantMap = {
  [0]: "red",
  [1]: "orange",
  [2]: "yellow",
  [3]: "green",
  [4]: "aqua",
  [5]: "blue",
  [6]: "purple",
  [7]: "pink",
};

type TShellBlock =
  | [5, 0]
  | [5, 1]
  | [5, 2]
  | [5, 3]
  | [5, 4]
  | [5, 5]
  | [5, 6]
  | [5, 7]
  | [5, 8]
  | [5, 9]
  | [5, 10]
  | [5, 11];

const tshellVariantMap = {
  [0]: "white",
  [1]: "gray",
  [2]: "black",
  [3]: "red",
  [4]: "orange",
  [5]: "yellow",
  [6]: "green",
  [7]: "aqua",
  [8]: "light-blue",
  [9]: "blue",
  [10]: "purple",
  [11]: "pink",
};

type PyramidBlock =
  | [6, 0]
  | [6, 1]
  | [6, 2]
  | [6, 3]
  | [6, 4]
  | [6, 5]
  | [6, 6]
  | [6, 7]
  | [6, 8]
  | [6, 9];

const pyramidVariantMap = {
  [0]: "white",
  [1]: "gray",
  [2]: "black",
  [3]: "red",
  [4]: "orange",
  [5]: "yellow",
  [6]: "green",
  [7]: "cyan",
  [8]: "blue",
  [9]: "purple",
};

type ChocolateBlock = [7, 0] | [7, 1] | [7, 2] | [7, 3] | [7, 4] | [7, 5] | [7, 6];

const chocolateVariantMap = {
  [0]: "l0",
  [1]: "l0mint",
  [2]: "l1",
  [3]: "l2",
  [4]: "l3",
  [5]: "l4",
  [6]: "l5",
};

type BoostBlock = [8, 0] | [8, 1] | [8, 2] | [8, 3];

const boostVariantMap = {
  [0]: "up",
  [1]: "right",
  [2]: "down",
  [3]: "left",
};

type KeysBlock = [9, 0] | [9, 1] | [9, 2];

// keys-red
const keysVariantMap = {
  [0]: "key",
  [1]: "door",
  [2]: "gate",
};

type ZoostBlock = [10, 0] | [10, 1] | [10, 2] | [10, 3];

const zoostVariantMap = {
  [0]: "up",
  [1]: "right",
  [2]: "down",
  [3]: "left",
};

type SignBlock = [11, { kind: "sign"; text: string }];

type SpikesPack = [12, 0] | [12, 1] | [12, 2] | [12, 3] | [12, 4];

const spikesVariantMap = {
  [0]: "up",
  [1]: "right",
  [2]: "down",
  [3]: "left",
  [4]: "[REPLACE]checkpoint",
};

const blockMap = {
  [0]: ["basic", basicVariantMap] as const,
  [1]: ["gun", gunVariantMap] as const,
  [2]: ["arrow", arrowVariantMap] as const,
  [3]: ["prismarine", prismarineVariantMap] as const,
  [4]: ["gemstone", gemstoneVariantMap] as const,
  [5]: ["tshell", tshellVariantMap] as const,
  [6]: ["pyramid", pyramidVariantMap] as const,
  [7]: ["choc", chocolateVariantMap] as const,
  [8]: ["boost", boostVariantMap] as const,
  [9]: ["keys-red", keysVariantMap] as const,
  [10]: ["zoost", zoostVariantMap] as const,
  [12]: ["spike", spikesVariantMap] as const,
};

/**
 * Only intended for use in the SFG Server.
 *
 * Loads version 1 world data, and only relies upon the tile loader resolving
 * by texture names.
 */
export function loadWorldVersion1(loader: FormatLoader, blocks: Block[][][]) {
  console.log("we're feeding it", blocks);
  for (let layerIdx = 0; layerIdx < blocks.length; layerIdx++) {
    const layer = blocks[layerIdx];
    if (!layer) continue;

    for (let y = 0; y < layer.length; y++) {
      const ys = layer[y];
      if (!ys) continue;

      for (let x = 0; x < ys.length; x++) {
        const block = ys[x];

        if (!block || block.length === 0) continue;

        if (block[0] === 11) {
          loader.world.set(layerIdx, x, y, loader.tiles.forTexture("sign").id);
          loader.heap.set(layerIdx, x, y, block[1]);
          continue;
        }

        const [packBase, variantMap] = blockMap[block[0]];

        //@ts-ignore
        const packVariant = variantMap[block[1]];

        const blockName = makePackName(packBase, packVariant);
        const realBlock = loader.tiles.forTexture(blockName);
        loader.world.set(layerIdx, x, y, realBlock.id);
      }
    }
  }
}

function makePackName(base: string, variant: string): string {
  const REPLACE = "[REPLACE]";
  if (variant.startsWith(REPLACE)) return variant.substring(REPLACE.length);
  else return base + "-" + variant;
}
