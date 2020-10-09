import TileManager from "../../../game/world/TileManager";
import VoidDisplay from "./VoidDisplay";

export default class Void {
  readonly display: VoidDisplay;

  constructor(scene: Phaser.Scene, tileManager: TileManager) {
    this.display = new VoidDisplay(scene, tileManager);
  }
}
