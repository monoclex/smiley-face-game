import { TileId, TileLayer } from "@smiley-face-game/common/types";
import Tile from "./Tile";
import M249LMG from "../../game/guns/models/variants/M249LMG";
import type { SpriteEx } from "../../phaser-tile-addons";
import mapTileNameToClientId from "./idLookup";
import RenderCanvasParams from "./RenderCanvasParams";

export default class GunTile implements Tile<TileId.Gun> {
  id: TileId.Gun = TileId.Gun;
  layer: TileLayer = TileLayer.Action;

  // TODO: collision handlers
  place(tile: Phaser.Tilemaps.Tile): void {
    let yeahtile = tile;
    tile.index = mapTileNameToClientId("gun");
    tile.setCollision(false);
    tile.setCollisionCallback((sprite: SpriteEx, tile: Phaser.Tilemaps.Tile) => {
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

  renderCanvas({ getFrame, context }: RenderCanvasParams<TileId.Gun>) {
    const { x, y, width, height, atlas } = getFrame(mapTileNameToClientId("gun"));
    context.drawImage(atlas, x, y, width, height, 0, 0, 32, 32);
  }
}
