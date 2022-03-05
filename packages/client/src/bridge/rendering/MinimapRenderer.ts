import { Vector } from "@smiley-face-game/api/physics/Vector";
import { Container, Renderer } from "pixi.js";

export default class MinimapRenderer {
  minimapRenderer?: Renderer;

  constructor(
    readonly stage: Container,
    readonly root: Container,
    readonly minimap: Container,
    readonly worldSize: Vector,
    readonly renderer: Renderer
  ) {
    this.minimap.width = worldSize.x;
    this.minimap.height = worldSize.y;
  }

  draw() {
    this.minimap.position.x = 0;
    this.minimap.position.y = 0;

    if (this.minimapRenderer) {
      this.minimapRenderer.render(this.minimap);
    }
  }
}
