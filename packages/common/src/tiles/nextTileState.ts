import TileState from "./TileState";
import { TileId } from "@smiley-face-game/schemas/TileId";
import nextRotation from "./nextRotation";
import nextPrismarineVariant from "./nextPrismarineVariant";
import nextColor from "@smiley-face-game/common/tiles/nextColor";

export default function nextTileState(current: TileState): TileState {
  switch (current.id) {
    case TileId.Basic:
      return { ...current, color: nextColor(current.color || "white") };
    case TileId.Arrow:
      return { ...current, rotation: nextRotation(current.rotation) };
    case TileId.Prismarine:
      return { ...current, variant: nextPrismarineVariant(current.variant) };
    default:
      return { ...current };
  }
}
