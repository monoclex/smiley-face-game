import { TileId } from "@smiley-face-game/common/schemas/TileId";
import { TileLayer } from "@smiley-face-game/common/schemas/TileLayer";
import Tile from "./Tile";
import M249LMG from "../../game/guns/models/variants/M249LMG";

export default class GunTile implements Tile<TileId.Gun> {
  id: TileId.Gun = TileId.Gun;
  layer: TileLayer = TileLayer.Action;

  // TODO: collision handlers
  place(tile: Phaser.Tilemaps.Tile): void {
    let yeahtile = tile;
    tile.index = this.id;
    tile.setCollision(false);
    tile.setCollisionCallback((sprite, tile) => {
      if (!sprite.player) {
        console.warn("unable to resolve tile collision", sprite, tile);
        return;
      }

      const player = sprite.player;
      if (!player.hasGun) player.instantiateGun(M249LMG, yeahtile);
    }, this);
  }

  onRemove(tile: Phaser.Tilemaps.Tile) {
    //@ts-ignore
    tile.setCollisionCallback(null, null);
  }
}
