import { TileId } from "@smiley-face-game/schemas/TileId";
import { TileLayer } from "@smiley-face-game/schemas/TileLayer";
import TileState from "@smiley-face-game/common/tiles/TileState";
import Tile from "./Tile";
import mapTileNameToClientId from "./idLookup";
import RenderCanvasParams from "./RenderCanvasParams";

export default class FullTile implements Tile<TileId.Basic> {
  id: TileId.Basic = TileId.Basic;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile, tileState: TileState & { id: TileId.Basic }): void {
    tile.setCollision(true);

    switch (tileState.color) {
      case "white":
      case undefined:
        {
          tile.index = mapTileNameToClientId("basic-white");
        }
        return;

      case "black":
        {
          tile.index = mapTileNameToClientId("basic-black");
        }
        return;

      case "brown":
        {
          tile.index = mapTileNameToClientId("basic-white");
          tile.tint = 0x70_42_14;
        }
        return;

      case "red":
        {
          tile.index = mapTileNameToClientId("basic-red");
        }
        return;

      case "orange":
        {
          tile.index = mapTileNameToClientId("basic-orange");
        }
        return;

      case "yellow":
        {
          tile.index = mapTileNameToClientId("basic-yellow");
        }
        return;

      case "green":
        {
          tile.index = mapTileNameToClientId("basic-green");
        }
        return;

      case "blue":
        {
          tile.index = mapTileNameToClientId("basic-blue");
        }
        return;

      case "purple":
        {
          tile.index = mapTileNameToClientId("basic-purple");
        }
        return;
    }
  }

  onRemove(tile: Phaser.Tilemaps.Tile) {
    tile.tint = 0xff_ff_ff;
  }

  renderCanvas({ getFrame, context }: RenderCanvasParams<TileId.Basic>) {
    const { x, y, width, height, atlas } = getFrame(mapTileNameToClientId("basic-white"));
    context.drawImage(atlas, x, y, width, height, 0, 0, 32, 32);
  }
}
