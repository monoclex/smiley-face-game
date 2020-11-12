import TileRegistration from "@smiley-face-game/common/src/tiles/TileRegistration";
import mapTileNameToClientId from "./idLookup";
import { SpriteEx } from "../../phaser-tile-addons";
import Player from "../player/Player";

export default class ArrowTiles {
  place(tileJson: TileRegistration, tile: Phaser.Tilemaps.Tile, id: number) {
    tile.index = mapTileNameToClientId(tileJson.texture(id));
    tile.setCollisionCallback((sprite: SpriteEx, tile: Phaser.Tilemaps.Tile) => {
      if (!sprite.player) {
        console.warn("unable to resolve tile collision", sprite, tile);
        return;
      }

      const player: Player = sprite.player;
      switch (tileJson.texture(id)) {
        case "arrow-up":
          player.physicsState.arrows.up = true;
          break;
        case "arrow-right":
          player.physicsState.arrows.right = true;
          break;
        case "arrow-down":
          player.physicsState.arrows.down = true;
          break;
        case "arrow-left":
          player.physicsState.arrows.left = true;
          break;
      }
    }, this);
  }

  remove(_tileJson: TileRegistration, tile: Phaser.Tilemaps.Tile) {
    //@ts-ignore
    tile.setCollisionCallback(null, null);
    tile.index = -1;
  }
}
