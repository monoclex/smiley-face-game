import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import M249LMG from "../guns/models/M249LMG";
import { SpriteEx } from "packages/client/src/phaser-tile-addons";
import mapTileNameToClientId from "./idLookup";

export default class GunTiles {
  place(tileJson: TileRegistration, tile: Phaser.Tilemaps.Tile, id: number) {
    let yeahtile = tile;
    tile.index = mapTileNameToClientId(tileJson.texture(id));
    tile.setCollisionCallback((sprite: SpriteEx, tile: Phaser.Tilemaps.Tile) => {
      if (!sprite.player) {
        console.warn("unable to resolve tile collision", sprite, tile);
        return;
      }

      const player = sprite.player;
      if (!player.hasGun) player.instantiateGun(M249LMG, yeahtile);
    }, this);
  }

  remove(_tileJson: TileRegistration, tile: Phaser.Tilemaps.Tile) {
    //@ts-ignore
    tile.setCollisionCallback(null, null);
    tile.index = -1;
  }
}
