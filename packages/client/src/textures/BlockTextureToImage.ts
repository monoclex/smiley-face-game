import { Application, Sprite, Texture } from "pixi.js";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

class TextureToImageifier {
  cache: Map<number, HTMLImageElement> = new Map();

  readonly app: Application = new Application({
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    backgroundAlpha: 0,
  });

  readonly sprite: Sprite = new Sprite();

  constructor() {
    this.app.stage.addChild(this.sprite);
  }

  async render(): Promise<HTMLImageElement> {
    this.app.render();

    const renderImageCanvas = this.app.view;

    const blob = await new Promise<Blob | null>((resolve) => renderImageCanvas.toBlob(resolve));
    if (!blob) throw new Error("couldn't make blob");

    const url = URL.createObjectURL(blob);

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
