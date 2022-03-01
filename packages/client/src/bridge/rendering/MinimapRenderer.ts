import { Vector } from "@smiley-face-game/api/physics/Vector";
import { Container, Renderer } from "pixi.js";

export default class MinimapRenderer {
  constructor(
    readonly stage: Container,
    readonly root: Container,
    readonly minimap: Container,
    readonly worldSize: Vector,
    readonly renderer: Renderer
  ) {
    this.stage.addChild(this.minimap);

    this.minimap.width = worldSize.x;
    this.minimap.height = worldSize.y;
  }

  draw() {
    const padding = new Vector(5, 5);
    const worldSize = this.worldSize;
    const screenSize = new Vector(this.renderer.width, this.renderer.height);

    const bottomRight = Vector.add(padding, worldSize);
    const minimapPosition = Vector.sub(screenSize, bottomRight);

    this.minimap.position.x = minimapPosition.x;
    this.minimap.position.y = minimapPosition.y;
  }
}
