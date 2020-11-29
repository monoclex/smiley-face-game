import TileManager from "../../../game/world/TileManager";
import LayerType from "./LayerType";

export default class Layer {
  readonly tilemapLayer: Phaser.Tilemaps.DynamicTilemapLayer;

  constructor(tileManager: TileManager, layer: LayerType) {
    const { tileset, tilemap } = tileManager;
    this.tilemapLayer = tilemap.createBlankDynamicLayer(layer, tileset);
    this.tilemapLayer.setCollisionBetween(0, 100);
    this.tilemapLayer.setCollisionByProperty({ collides: true });
  }
}
