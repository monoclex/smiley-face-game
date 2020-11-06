import type { ZBlock } from "@smiley-face-game/common/types";
import { TileId, Rotation, PrismarineVariant } from "@smiley-face-game/common/types";

export function defaultFor(id: TileId): ZBlock {
  switch (id) {
    case TileId.Arrow:
      return { id, rotation: Rotation.Up };

    case TileId.Prismarine:
      return { id, variant: PrismarineVariant.Basic };

    default:
      return { id };
  }
}
