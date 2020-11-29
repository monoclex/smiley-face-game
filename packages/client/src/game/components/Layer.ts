import TileManager from "../world/TileManager";
type LayerType = "decoration" | "foreground" | "action" | "background";

export default class Layer {
  readonly tilemapLayer: Phaser.Tilemaps.DynamicTilemapLayer;

  constructor(tileManager: TileManager, layer: LayerType) {
    const { tileset, tilemap } = tileManager;
    this.tilemapLayer = tilemap.createBlankDynamicLayer(layer, tileset);
    this.tilemapLayer.setCollisionBetween(0, 100);
    this.tilemapLayer.setCollisionByProperty({ collides: true });
  }
}
