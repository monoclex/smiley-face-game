import TileState from "./TileState";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import nextRotation from "./nextRotation";

export default function nextTileState(current: TileState): TileState {
  switch (current.id) {
    case TileId.Arrow:
      return { ...current, rotation: nextRotation(current.rotation) };
    default:
      return { ...current };
  }
}
