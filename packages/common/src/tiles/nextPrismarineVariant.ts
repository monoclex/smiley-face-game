import { PrismarineVariant } from "@smiley-face-game/common/types";

export default function next(current: PrismarineVariant): PrismarineVariant {
  switch (current) {
    case PrismarineVariant.Basic: return PrismarineVariant.Anchor;
    case PrismarineVariant.Anchor: return PrismarineVariant.Brick;
    case PrismarineVariant.Brick: return PrismarineVariant.Slab;
    case PrismarineVariant.Slab: return PrismarineVariant.Crystal;
    case PrismarineVariant.Crystal: return PrismarineVariant.Basic;
  }
}
