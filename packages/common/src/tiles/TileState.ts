import { TileId } from "@smiley-face-game/schemas/TileId";
import { Rotation } from "@smiley-face-game/schemas/Rotation";
import { Block } from "@smiley-face-game/schemas/Block";
import { PrismarineVariant } from "@smiley-face-game/schemas/PrismarineVariantSchema";

type TileState = Block;

export default TileState;
export function defaultFor(id: TileId): TileState {
  switch (id) {
    case TileId.Arrow:
      return { id, rotation: Rotation.Up };

    case TileId.Prismarine:
      return { id, variant: PrismarineVariant.Basic };

    default:
      return { id };
  }
}
