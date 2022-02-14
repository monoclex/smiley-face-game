import { FormatLoader } from "./FormatLoader";

type Block = undefined | null | { id: 0 } | SolidBlock | GunBlock | ArrowBlock | PrismarineBlock;

type SolidBlock = {
  id: 1;
  color?: "white" | "black" | "brown" | "red" | "orange" | "yellow" | "green" | "blue" | "purple";
};

type GunBlock = { id: 2 };

type ArrowBlock = { id: 3; rotation: 0 | 1 | 2 | 3 };

type PrismarineBlock = { id: 4; variant: 0 | 1 | 2 | 3 | 4 };

type Position = { x: number; y: number; layerIdx: number };

/**
 * Only intended for use in the SFG Server.
 *
 * Loads version 0 world data, and **only** relies upon the tile loader resolving
 * by texture names.
 */
export function loadWorldVersion0(loader: FormatLoader, blocks: Block[][][]) {
  for (let layerIdx = 0; layerIdx < blocks.length; layerIdx++) {
    const layer = blocks[layerIdx];
    if (!layer) continue;

    for (let y = 0; y < layer.length; y++) {
      const ys = layer[y];
      if (!ys) continue;

      for (let x = 0; x < ys.length; x++) {
        const block = ys[x];

        if (!block || block.id === 0) continue;

        const position = { layerIdx, x, y };

        // prettier-ignore
        switch (block.id) {
          case 1: convertSolid     (loader, position, block); break;
          case 2: convertGun       (loader, position, block); break;
          case 3: convertArrow     (loader, position, block); break;
          case 4: convertPrismarine(loader, position, block); break;
        }
      }
    }
  }
}

function set(loader: FormatLoader, { layerIdx, x, y }: Position, id: number) {
  loader.world.set(layerIdx, x, y, id);
}

function convertSolid(loader: FormatLoader, position: Position, oldBlock: SolidBlock) {
  const color = oldBlock.color || "white";
  const block = loader.tiles.forTexture(`block-${color}`);
  set(loader, position, block.id);
  loader.world.set(position.layerIdx, position.x, position.y, block.id);
}

function convertGun(loader: FormatLoader, position: Position, _oldBlock: GunBlock) {
  const block = loader.tiles.forTexture("gun");
  set(loader, position, block.id);
}

const arrowRotationMap = {
  [0]: "up",
  [1]: "right",
  [2]: "down",
  [3]: "left",
};

function convertArrow(loader: FormatLoader, position: Position, oldBlock: ArrowBlock) {
  const rotation = arrowRotationMap[oldBlock.rotation];
  const block = loader.tiles.forTexture(`arrow-${rotation}`);
  set(loader, position, block.id);
}

const prismarineVariantMap = {
  [0]: "basic",
  [1]: "anchor",
  [2]: "brick",
  [3]: "slab",
  [4]: "crystal",
};

function convertPrismarine(loader: FormatLoader, position: Position, oldBlock: PrismarineBlock) {
  const variant = prismarineVariantMap[oldBlock.variant];
  const block = loader.tiles.forTexture(`prismarine-${variant}`);
  set(loader, position, block.id);
}
