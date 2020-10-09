import { TileId } from "@smiley-face-game/schemas/TileId";
import Block from "@smiley-face-game/common/tiles/TileState";

export default function copyBlock(
  setDestination: (value: Block) => void,
  source: Block
) {
  switch (source.id) {
    case TileId.Empty:
    case TileId.Gun: setDestination({ id: source.id }); break;
    case TileId.Full: setDestination({ id: source.id, color: source.color }); break;
    case TileId.Arrow: setDestination({ id: TileId.Arrow, rotation: source.rotation }); break;
  }
}
