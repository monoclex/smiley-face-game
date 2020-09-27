import Player from "@/game/player/Player";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import Tile from "./Tile";

export default class ArrowTile implements Tile {
  id: TileId = TileId.Arrow;
  layer: TileLayer = TileLayer.Action;

  place(tile: Phaser.Tilemaps.Tile): void {
    tile.index = this.id;
    tile.setCollision(false);

    tile.setCollisionCallback((sprite, tile) => {
      if (!sprite.player) {
        console.warn("unable to resolve tile collision", sprite, tile);
        return;
      }

      const player: Player = sprite.player;
      player.physicsState.arrows.up = true;
    }, this);
  }

  onRemove(tile: Phaser.Tilemaps.Tile) {
    //@ts-ignore
    tile.setCollisionCallback(null, null);
  }
}
