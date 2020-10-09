import Player from "../../game/player/Player";
import { Rotation } from "@smiley-face-game/schemas/Rotation";
import { TileId } from "@smiley-face-game/schemas/TileId";
import { TileLayer } from "@smiley-face-game/schemas/TileLayer";
import TileState from "@smiley-face-game/common/tiles/TileState";
import Tile from "./Tile";
import type { SpriteEx } from "../../phaser-tile-addons";

export default class ArrowTile implements Tile<TileId.Arrow> {
  id: TileId.Arrow = TileId.Arrow;
  layer: TileLayer = TileLayer.Action;

  place(tile: Phaser.Tilemaps.Tile, tileState: TileState & { id: TileId.Arrow }): void {
    tile.index = this.id;
    tile.setCollision(false);
    tile.rotation = tileState.rotation * -(Math.PI / 2); // `-` to combat phaser weirdness :v

    tile.setCollisionCallback((sprite: SpriteEx, tile: Phaser.Tilemaps.Tile) => {
      if (!sprite.player) {
        console.warn("unable to resolve tile collision", sprite, tile);
        return;
      }

      const player: Player = sprite.player;
      switch (tileState.rotation) {
        case Rotation.Up:
          player.physicsState.arrows.up = true;
          break;
        case Rotation.Right:
          player.physicsState.arrows.right = true;
          break;
        case Rotation.Down:
          player.physicsState.arrows.down = true;
          break;
        case Rotation.Left:
          player.physicsState.arrows.left = true;
          break;
      }
    }, this);
  }

  onRemove(tile: Phaser.Tilemaps.Tile) {
    //@ts-ignore
    tile.setCollisionCallback(null, null);
    tile.rotation = 0;
  }
}
