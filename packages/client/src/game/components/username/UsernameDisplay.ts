import ComponentDisplay from "@/game/components/ComponentDisplay";

export default class UsernameDisplay implements ComponentDisplay {
  readonly textObject: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene, text: string) {
    this.textObject = scene.add.text(0, 0, text)
      .setFont('Consolas')
      .setOrigin(0.5, 0);
  }

  get depth() {
    return this.textObject.depth;
  }

  set depth(value) {
    this.textObject.depth = value;
  }
}
