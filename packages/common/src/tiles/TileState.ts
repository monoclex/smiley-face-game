import { TileId } from "@smiley-face-game/common/schemas/TileId";
import { Rotation } from "@smiley-face-game/common/schemas/Rotation";
import { Block } from "../schemas/Block";

type TileState = Block;

export default TileState;
export function defaultFor(id: TileId): TileState {
  switch (id) {
    case TileId.Arrow:
      return { id, rotation: Rotation.Up };

    default:
      return { id };
  }
}
