import { TileId } from "@smiley-face-game/api/schemas/TileId";
import Block from "@smiley-face-game/api/tiles/TileState";

export default function copyBlock(setDestination: (value: Block) => void, source: Block) {
  switch (source.id) {
    case TileId.Empty:
    case TileId.Full:
    case TileId.Gun: {
      setDestination({ id: source.id });
    } break;
  
    case TileId.Arrow: {
      setDestination({ id: TileId.Arrow, rotation: source.rotation });
    } break;
  }
}
