import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import Tile from "./Tile";
import { Character } from "../characters/Character";
import M249LMG from "@/game/guns/models/variants/M249LMG";

export default class GunTile implements Tile {
  id: TileId = TileId.Gun;
  layer: TileLayer = TileLayer.Action;

  // TODO: collision handlers
  place(tile: Phaser.Tilemaps.Tile): void {
    tile.index = this.id;
    tile.setCollision(false);
    //@ts-ignore
    tile.setCollisionCallback((sprite, tile) => {
      if (!sprite.character) {
        console.warn("unable to resolve tile collision", sprite, tile);
        return;
      }

      const character: Character = sprite.character;
      const player = character.getPlayer();
      if (!player.gun) player.instantiateGun(M249LMG);
    }, this);
  }

  onRemove(tile: Phaser.Tilemaps.Tile) {
    //@ts-ignore
    tile.setCollisionCallback(null, null);
  }
}
