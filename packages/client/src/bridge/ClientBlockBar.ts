import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { selectedBlockState } from "../state";
import textures from "./textures";
import { blockTextureToImage } from "../textures/BlockTextureToImage";

export default class ClientBlockBar {
  cache: Map<number, HTMLImageElement> = new Map();

  constructor(private readonly tileJson: TileRegistration) {}

  async load(id: number): Promise<HTMLImageElement> {
    const cacheImage = this.cache.get(id);
    if (cacheImage) return cacheImage;

    const resource = textures.block(id);
    const image = await blockTextureToImage((sprite) => (sprite.texture = resource));

    this.cache.set(id, image);
    return image;
  }

  get selectedBlock(): number {
    return selectedBlockState.it?.id ?? 0;
  }
}
