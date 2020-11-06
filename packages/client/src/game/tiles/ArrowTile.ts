import Player from "../../game/player/Player";
import { Rotation, TileId, TileLayer } from "@smiley-face-game/common/types";
import type { ZBlock } from "@smiley-face-game/common/types";
import Tile from "./Tile";
import type { SpriteEx } from "../../phaser-tile-addons";
import mapTileNameToClientId from "./idLookup";
import RenderCanvasParams from "./RenderCanvasParams";

export default class ArrowTile implements Tile<TileId.Arrow> {
  id: TileId.Arrow = TileId.Arrow;
  layer: TileLayer = TileLayer.Action;

  place(tile: Phaser.Tilemaps.Tile, tileState: ZBlock & { id: TileId.Arrow }): void {
    tile.index = mapTileNameToClientId("arrow");
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

  renderCanvas({ getFrame, block, context }: RenderCanvasParams<TileId.Arrow>) {
    // apparently we need to rotate before drawing the image... ?????
    // https://stackoverflow.com/a/17412387
    context.clearRect(0, 0, 32, 32);
    context.save();
    context.translate(32 / 2, 32 / 2);
    switch (block.rotation) {
      case Rotation.Right:
        break; // it already faces right by default
      case Rotation.Up:
        context.rotate(-Math.PI / 2);
        break;
      case Rotation.Left:
        context.rotate(-Math.PI);
        break;
      case Rotation.Down:
        context.rotate((-3 * Math.PI) / 2);
        break;
    }

    const { x, y, width, height, atlas } = getFrame(mapTileNameToClientId("arrow"));
    context.drawImage(atlas, x, y, width, height, -width / 2, -height / 2, 32, 32);
    context.restore();
  }
}
