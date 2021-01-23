import { resources } from "pixi.js";
import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { blockbar } from "../../recoil/atoms/blockbar";
import textures from "../textures";
import findTexture from "../helpers/atlasFindFrame";

export default class ClientBlockBar {
  constructor(private readonly tileJson: TileRegistration) {
    blockbar.modify({
      slots: {
        ...blockbar.state.slots,
        [0]: tileJson.id("empty"),
        [1]: tileJson.id("basic-white"),
        [2]: tileJson.id("gun"),
        [3]: tileJson.id("arrow-up"),
        [4]: tileJson.id("prismarine-basic"),
        [5]: tileJson.id("gemstone-red"),
        [6]: tileJson.id("tshell-white"),
        [7]: tileJson.id("pyramid-white"),
        [8]: tileJson.id("choc-l0"),
      },
    });
  }

  async load(id: number): Promise<HTMLImageElement> {
    const textureName = this.tileJson.texture(id);
    const textureFrame = findTexture(textureName);

    const resource = textures.block(id).baseTexture.resource;
    if (!(resource instanceof resources.BaseImageResource)) {
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

    const context = renderImageCanvas.getContext("2d")!;

    const { x, y, w, h } = textureFrame.frame;
    context.drawImage(resource.source, x, y, w, h, 0, 0, TILE_WIDTH, TILE_HEIGHT);

    const blob = await new Promise((resolve) => renderImageCanvas.toBlob(resolve));
    const url = URL.createObjectURL(blob);

    const tileTexture = new Image();
    tileTexture.src = url;
    return tileTexture;
  }

  get selectedBlock(): number {
    return blockbar.state.slots[blockbar.state.selected];
  }
}
