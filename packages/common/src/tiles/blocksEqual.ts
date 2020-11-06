import { TileId } from "@smiley-face-game/common/types";
import type { ZBlock } from "@smiley-face-game/common/types";

export default function blocksEqual(a: ZBlock, b: ZBlock) {
  if (a.id === b.id) {
    if (a.id === TileId.Arrow && b.id === TileId.Arrow) {
      return a.rotation === b.rotation;
    } else if (a.id === TileId.Basic && b.id == TileId.Basic) {
      return (a.color || "white") === (b.color || "white");
    } else if (a.id === TileId.Prismarine && b.id === TileId.Prismarine) {
      return a.variant === b.variant;
    } else return true;
  } else return false;
}
