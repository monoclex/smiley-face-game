import { resources } from "pixi.js";
import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import atlasJson from "../assets/atlas_atlas.json";
import { blockbar } from "../recoil/atoms/blockbar";
import textures from "./textures";

export default class ClientBlockBar {
  constructor(private readonly tileJson: TileRegistration) {
    blockbar.modify({
      // TODO: maybe this could be an instance method on this class instead?
      loader: async (id) => {
        const textureName = tileJson.texture(id);
        const textureFrame = find(textureName);

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

        const { x, y, w: width, h: height } = textureFrame.frame;
        context.drawImage(resource.source, x, y, width, height, 0, 0, TILE_WIDTH, TILE_HEIGHT);

        const blob = await new Promise((resolve) => renderImageCanvas.toBlob(resolve));
        const url = URL.createObjectURL(blob);

        const tileTexture = new Image();
        tileTexture.src = url;
        return tileTexture;
      },
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

    function find(textureName: string) {
      // TODO: move atlas json stuff to its own component
      for (const frame of atlasJson.frames) {
        if (frame.filename === textureName) {
          return frame;
        }
      }
      throw new Error("couldn't find texture " + textureName);
    }
  }

  get selectedBlock(): number {
    return blockbar.state.slots[blockbar.state.selected];
  }
}
