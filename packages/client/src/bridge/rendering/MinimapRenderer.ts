import { Game, TileLayer } from "@smiley-face-game/api";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { minimapColors } from "@smiley-face-game/api/tiles/register";
import { Viewport } from "pixi-viewport";
import { Container, Graphics, Renderer } from "pixi.js";

export default class MinimapRenderer {
  minimapRenderer?: Renderer;
  viewport!: Viewport;
  graphics: Graphics;

  constructor(readonly game: Game, readonly stage: Container) {
    const worldSize = game.blocks.size;
    this.stage.width = worldSize.x;
    this.stage.height = worldSize.y;

    this.graphics = new Graphics();
    this.graphics.lineStyle({ width: 0 });

    this.stage.addChild(this.graphics);

    game.blocks.events.on("block", (layer, position) => {
      if (layer === TileLayer.Action || layer === TileLayer.Decoration) return;

      this.computeColor(position);
    });

    game.blocks.events.on("load", () => this.repaint());
    this.repaint();
  }

  setRenderer(renderer: Renderer) {
    const { x, y } = this.game.blocks.size;
    this.viewport = new Viewport({
      worldWidth: x,
      worldHeight: y,
      interaction: renderer.plugins["interaction"],
    });

    this.viewport.drag().pinch().wheel();
    this.viewport.addChild(this.stage);

    this.minimapRenderer = renderer;
  }

  computeColor(position: Vector) {
    const foregroundBlock = this.game.blocks.blockAt(position, TileLayer.Foreground);

    if (foregroundBlock !== 0) {
      this.paintPixel(position, foregroundBlock);
      return;
    }

    const backgroundBlock = this.game.blocks.blockAt(position, TileLayer.Background);

    this.paintPixel(position, backgroundBlock);
  }

  paintPixel({ x, y }: Vector, blockId: number) {
    const textureName = this.game.tiles.forId(blockId).textureId;
    //@ts-expect-error `textureName` isn't properly typed
    const color = minimapColors()[textureName];

    this.graphics.beginFill(color, 1);
    this.graphics.drawRect(x, y, 1, 1);
  }

  repaint() {
    for (let y = 0; y < this.game.blocks.size.y; y++) {
      for (let x = 0; x < this.game.blocks.size.x; x++) {
        this.computeColor({ x, y });
      }
    }
  }

  draw() {
    this.stage.position.x = 0;
    this.stage.position.y = 0;

    if (this.minimapRenderer) {
      this.minimapRenderer.render(this.viewport);
    }
  }
}
