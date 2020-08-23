import Component from "@/game/components/Component";
import TileManager from "@/game/world/TileManager";
import VoidDisplay from "./VoidDisplay";

export default class Void implements Component {
  readonly display: VoidDisplay;

  constructor(scene: Phaser.Scene, tileManager: TileManager) {
    this.display = new VoidDisplay(scene, tileManager);
  }
}
