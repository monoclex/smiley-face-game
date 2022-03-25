import { Container, InteractionManager, Renderer, Sprite, Texture, Ticker } from "pixi.js";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

class TextureToImageifier {
  cache: Map<number, HTMLImageElement> = new Map();

  readonly app: Renderer = new Renderer({
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    backgroundAlpha: 0,
  });

  readonly sprite: Sprite = new Sprite();
  readonly stage: Container = new Container();

  constructor() {
    this.stage.addChild(this.sprite);

    const interactionManager = this.app.plugins["interaction"] as InteractionManager;
    interactionManager.destroy();
    //@ts-expect-error we want it gone
    interactionManager.removeTickerListener();
    Ticker.system.stop();
  }

  async render(): Promise<HTMLImageElement> {
    this.app.render(this.stage);

    const renderImageCanvas = this.app.view;

    const blob = await new Promise<Blob | null>((resolve) => renderImageCanvas.toBlob(resolve));
    if (!blob) throw new Error("couldn't make blob");

    const url = URL.createObjectURL(blob);

    this.sprite.x = 0;
    this.sprite.y = 0;

    const tileTexture = new Image();
    tileTexture.src = url;
    return tileTexture;
  }
}

const instance = new TextureToImageifier();

export function blockTextureToImage(draw: (sprite: Sprite) => void): Promise<HTMLImageElement> {
  draw(instance.sprite);
  return instance.render();
}

export async function cloneTexture(draw: (sprite: Sprite) => void): Promise<Texture> {
  const image = await blockTextureToImage(draw);
  return Texture.from(image);
}
