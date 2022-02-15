import {
  BaseImageResource,
  Graphics,
  CanvasResource,
  RenderTexture,
  Renderer,
  Sprite,
  Application,
} from "pixi.js";
import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { selectedBlockState } from "../state";
import textures from "./textures";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

export default class ClientBlockBar {
  cache: Map<number, HTMLImageElement> = new Map();

  readonly app: Application = new Application({
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    backgroundAlpha: 0,
  });

  readonly sprite: Sprite = new Sprite();

  constructor(private readonly tileJson: TileRegistration) {
    this.app.stage.addChild(this.sprite);
  }

  async load(id: number): Promise<HTMLImageElement> {
    const cacheImage = this.cache.get(id);
    if (cacheImage) return cacheImage;

    const resource = textures.block(id);

    this.sprite.texture = resource;
    this.app.render();

    const renderImageCanvas = this.app.view;

    const blob = await new Promise<Blob | null>((resolve) => renderImageCanvas.toBlob(resolve));
    if (!blob) throw new Error("couldn't make blob");

    const url = URL.createObjectURL(blob);

    const tileTexture = new Image();
    tileTexture.src = url;

    this.cache.set(id, tileTexture);
    return tileTexture;
  }

  get selectedBlock(): number {
    return selectedBlockState.it?.id ?? 0;
  }
}
