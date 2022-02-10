import { BaseImageResource } from "pixi.js";
import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { selectedBlockState } from "../state";
import textures from "./textures";
import findTexture from "./atlasFindFrame";

export default class ClientBlockBar {
  cache: Map<number, HTMLImageElement> = new Map();

  constructor(private readonly tileJson: TileRegistration) {}

  async load(id: number): Promise<HTMLImageElement> {
    const cacheImage = this.cache.get(id);
    if (cacheImage) return cacheImage;

    const textureName = this.tileJson.texture(id);
    const textureFrame = findTexture(textureName);

    const resource = textures.block(id).baseTexture.resource;
    if (!(resource instanceof BaseImageResource)) {
      throw new Error("atlas not png, huh?");
    }

    if ("ownerSVGElement" in resource.source) {
      throw new Error("cant use svg as resource");
    }

    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;
    const renderImageCanvas = document.createElement("canvas");
    renderImageCanvas.width = TILE_WIDTH;
    renderImageCanvas.height = TILE_HEIGHT;

    const context = renderImageCanvas.getContext("2d");
    if (context === null) throw new Error("unable to make render image canvas");

    const { x, y, w, h } = textureFrame.frame;
    context.drawImage(resource.source, x, y, w, h, 0, 0, TILE_WIDTH, TILE_HEIGHT);

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
