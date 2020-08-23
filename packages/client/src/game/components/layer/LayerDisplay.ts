import ComponentDisplay from "@/game/components/ComponentDisplay";
import TileManager from "@/game/world/TileManager";
import LayerType from "./LayerType";

export default class LayerDisplay implements ComponentDisplay {
  readonly tilemapLayer: Phaser.Tilemaps.DynamicTilemapLayer;

  constructor(tileManager: TileManager, layer: LayerType) {
    const { tileset, tilemap } = tileManager;
    this.tilemapLayer = tilemap.createBlankDynamicLayer(layer, tileset);
    this.tilemapLayer.setCollisionBetween(0, 100);
    this.tilemapLayer.setCollisionByProperty({ collides: true });
  }

  get depth() {
    return this.tilemapLayer.depth;
  }

  set depth(value) {
    this.tilemapLayer.depth = value;
  }
}
