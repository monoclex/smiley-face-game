import { TileId } from "@smiley-face-game/schemas/TileId";
import Block from "@smiley-face-game/common/tiles/TileState";

export default function copyBlock(setDestination: (value: Block) => void, source: Block) {
  switch (source.id) {
    case TileId.Empty:
    case TileId.Gun:
      setDestination({ id: source.id });
      break;
    case TileId.Basic:
      setDestination({ id: source.id, color: source.color });
      break;
    case TileId.Arrow:
      setDestination({ id: source.id, rotation: source.rotation });
      break;
    case TileId.Prismarine:
      setDestination({ id: source.id, variant: source.variant });
      break;
  }
}
