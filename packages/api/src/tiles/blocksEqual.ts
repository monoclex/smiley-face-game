import { TileId } from "@smiley-face-game/api/schemas/TileId";
import Block from "@smiley-face-game/api/tiles/TileState";

export default function blocksEqual(a: Block, b: Block) {
  if (a.id === b.id) {
    if (a.id === TileId.Arrow && b.id === TileId.Arrow) {
      return a.rotation === b.rotation;
    }
    else if (a.id === TileId.Full && b.id == TileId.Full) {
      return (a.color || "white") === (b.color || "white");
    }
    else return true;
  } else return false;
}
