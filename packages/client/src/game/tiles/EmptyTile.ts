import { TileId, TileLayer } from "@smiley-face-game/common/types";
import Tile from "./Tile";
import RenderCanvasParams from "./RenderCanvasParams";
import mapTileNameToClientId from "./idLookup";

export default class EmptyTile implements Tile<TileId.Empty> {
  id: TileId.Empty = TileId.Empty;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile): void {
    tile.index = -1;
    tile.setCollision(false);
  }

  renderCanvas({ getFrame, context }: RenderCanvasParams<TileId.Empty>) {
    const { x, y, width, height, atlas } = getFrame(mapTileNameToClientId("empty"));
    context.drawImage(atlas, x, y, width, height, 0, 0, 32, 32);
  }
}
