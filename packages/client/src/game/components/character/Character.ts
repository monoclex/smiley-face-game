import Component from "@/game/components/Component";
import CharacterDisplay from "./CharacterDisplay";

export default class Character implements Component {
  readonly display: CharacterDisplay;

  constructor(scene: Phaser.Scene) {
    this.display = new CharacterDisplay(scene, "smiley");
  }
}
