import TileManager from "../world/TileManager";
import key from "../world/key";

export default class Void {
  readonly sprite: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene, tileManager: TileManager) {
    const { tilemap } = tileManager;

    // the void is just the empty tile repeating
    // TODO: figure out how to make 'atlas' not default to tile `0`, as the implicit requirement may be bad
    this.sprite = scene.add.tileSprite(
      tilemap.widthInPixels / 2,
      tilemap.heightInPixels / 2,
      tilemap.widthInPixels,
      tilemap.heightInPixels,
      key("tiles"),
      "empty" // mapTileNameToClientId("empty")
    );
  }
}
