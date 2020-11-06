import { TileId } from "@smiley-face-game/common/types";
import type { ZBlock } from "@smiley-face-game/common/types";

export default function copyBlock(setDestination: (value: ZBlock) => void, source: ZBlock) {
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
