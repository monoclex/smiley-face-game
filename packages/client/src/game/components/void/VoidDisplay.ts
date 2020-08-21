import ComponentDisplay from "@/game/components/ComponentDisplay";
import TileManager from "@/game/tiles/TileManager";
import key from "@/game/tiles/key";

export default class VoidDisplay implements ComponentDisplay {
  readonly sprite: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene, tileManager: TileManager) {
    const { tilemap } = tileManager;

    // the void is just the empty tile repeating
    // TODO: figure out how to make 'atlas' not default to tile `0`, as the implicit requirement may be bad
    this.sprite = scene.add.tileSprite(
      tilemap.widthInPixels / 2, tilemap.heightInPixels / 2,
      tilemap.widthInPixels, tilemap.heightInPixels,
      key("tiles")
    );
  }

  get depth() {
    return this.sprite.depth;
  }

  set depth(value) {
    this.sprite.depth = value;
  }
}
