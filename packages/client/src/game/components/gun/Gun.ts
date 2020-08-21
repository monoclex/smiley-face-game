import Component from "@/game/components/Component";
import GunDisplay from "./GunDisplay";

export default class Character implements Component {
  readonly display: GunDisplay;

  constructor(scene: Phaser.Scene) {
    this.display = new GunDisplay(scene, "gun");
  }
}
