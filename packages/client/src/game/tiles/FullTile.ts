import { TileId } from "@smiley-face-game/schemas/TileId";
import { TileLayer } from "@smiley-face-game/schemas/TileLayer";
import TileState from "@smiley-face-game/common/tiles/TileState";
import Tile from "./Tile";
import mapTileNameToClientId from "./idLookup";
import RenderCanvasParams from "./RenderCanvasParams";
import { Color } from "@smiley-face-game/schemas/Color";

export default class FullTile implements Tile<TileId.Basic> {
  id: TileId.Basic = TileId.Basic;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile, tileState: TileState & { id: TileId.Basic }): void {
    tile.setCollision(true);
    tile.index = this.index(tileState.color);
  }

  renderCanvas({ getFrame, context, block }: RenderCanvasParams<TileId.Basic>) {
    const { x, y, width, height, atlas } = getFrame(this.index(block.color));
    context.drawImage(atlas, x, y, width, height, 0, 0, 32, 32);
  }

  private index(color: Color | null | undefined): number {
    switch (color) {
      case "white":
      case null:
      case undefined:
        return mapTileNameToClientId("basic-white");
      case "black":
        return mapTileNameToClientId("basic-black");

      case "brown":
        return mapTileNameToClientId("basic-brown");

      case "red":
        return mapTileNameToClientId("basic-red");

      case "orange":

        return mapTileNameToClientId("basic-orange");

      case "yellow":
        {
          return mapTileNameToClientId("basic-yellow");
        }

      case "green":
        {
          return mapTileNameToClientId("basic-green");
        }

      case "blue":
        {
          return mapTileNameToClientId("basic-blue");
        }

      case "purple":
        {
          return mapTileNameToClientId("basic-purple");
        }
    }
  }
}
