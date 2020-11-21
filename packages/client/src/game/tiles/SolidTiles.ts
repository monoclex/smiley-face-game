import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import mapTileNameToClientId from "./idLookup";

export default class SolidTiles {
  place(tileJson: TileRegistration, tile: Phaser.Tilemaps.Tile, id: number) {
    tile.setCollision(true);
    tile.index = mapTileNameToClientId(tileJson.texture(id));
  }

  remove(_tileJson: TileRegistration, tile: Phaser.Tilemaps.Tile) {
    tile.setCollision(false);
    tile.index = -1;
  }
}
