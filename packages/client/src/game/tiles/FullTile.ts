import { TileId } from "@smiley-face-game/schemas/TileId";
import { TileLayer } from "@smiley-face-game/schemas/TileLayer";
import TileState from "@smiley-face-game/common/tiles/TileState";
import Tile from "./Tile";

export default class FullTile implements Tile<TileId.Full> {
  id: TileId.Full = TileId.Full;
  layer: TileLayer = TileLayer.Foreground;

  place(tile: Phaser.Tilemaps.Tile, tileState: TileState & { id: TileId.Full }): void {
    tile.index = this.id;
    tile.setCollision(true);

    switch (tileState.color) {
      case "white":
      case undefined:
        {
          tile.tint = 0xff_ff_ff;
        }
        return;

      case "black":
        {
          tile.tint = 0x33_33_33;
        }
        return;

      case "brown":
        {
          tile.tint = 0x70_42_14;
        }
        return;

      case "red":
        {
          tile.tint = 0xff_00_00;
        }
        return;

      case "orange":
        {
          tile.tint = 0xff_45_00;
        }
        return;

      case "yellow":
        {
          tile.tint = 0xff_ff_00;
        }
        return;

      case "green":
        {
          tile.tint = 0x00_ff_00;
        }
        return;

      case "blue":
        {
          tile.tint = 0x00_00_ff;
        }
        return;

      case "purple":
        {
          tile.tint = 0xff_00_ff;
        }
        return;
    }
  }

  onRemove(tile: Phaser.Tilemaps.Tile) {
    tile.tint = 0xff_ff_ff;
  }
}
