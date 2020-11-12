import TileRegistration from "@smiley-face-game/common/src/tiles/TileRegistration";

export default class EmptyTiles {
  place(_tileJson: TileRegistration, tile: Phaser.Tilemaps.Tile) {
    tile.setCollision(false);
  }

  remove(_tileJson: TileRegistration, _tile: Phaser.Tilemaps.Tile) {
  }
}
