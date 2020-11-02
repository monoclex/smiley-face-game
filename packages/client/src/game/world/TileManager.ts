import { TileId } from "@smiley-face-game/schemas/TileId";
import { Size } from "@smiley-face-game/schemas/Size";
import urlAtlas from "../../assets/atlas.png";
import atlasJson from "../../assets/atlas_atlas.json";
import key from "./key";
import { Block } from "@smiley-face-game/schemas/Block";
import { Rotation } from "@smiley-face-game/schemas/Rotation";
import tileLookup from "../../game/tiles/tileLookup";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

export default class TileManager {
  readonly tilemap: Phaser.Tilemaps.Tilemap;
  readonly tileset: Phaser.Tilemaps.Tileset;

  static load(loader: Phaser.Loader.LoaderPlugin) {
    loader.atlas({
      key: key("tiles"),
      textureURL: urlAtlas,
      atlasURL: atlasJson, // it's not a url (despite prop being atlasURL)
    });
  }

  constructor(readonly scene: Phaser.Scene, worldSize: Size) {
    this.tilemap = scene.make.tilemap({
      width: worldSize.width,
      height: worldSize.height,
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT,
    });

    // i have to add this offset bullcrud smh
    // margin is 1px and spacing is 1px from gammafp's tool
    this.tileset = this.tilemap.addTilesetImage("tilemap", key("tiles"), 32, 32, 2, 3);
  }

  /**
   * Given a block, this will create a unique image for that tile. It may be worthwhile to investigate optimizing this later, but for now,
   * it works and I'm not gonna touch it.
   * @param block The block to fetch an image for.
   */
  async imageOf(block: Block): Promise<HTMLImageElement> {
    // so we have the original image source for the texture atlas, we'll use an offscreen canvas to render specifically just the
    // texture from the atlas that we want into a canvas, dump it into some base64, and provide that as an image

    const renderImageCanvas = document.createElement("canvas");
    renderImageCanvas.width = TILE_WIDTH;
    renderImageCanvas.height = TILE_HEIGHT;

    const context = renderImageCanvas.getContext("2d")!;

    tileLookup[block.id].renderCanvas({
      //@ts-ignore shh it is correct
      block,
      renderImageCanvas, context,
      getFrame: ((index: number) => {
        const frame = this.frameOfTile(index);
        return {
          atlas: frame.source.source as HTMLImageElement,
          //@ts-ignore
          x: frame.customData.frame.x as number,
          //@ts-ignore
          y: frame.customData.frame.y as number,
          //@ts-ignore
          width: frame.customData.frame.w as number,
          //@ts-ignore
          height: frame.customData.frame.h as number,
        };
      }).bind(this)
    });

    const blob = await new Promise((resolve) => renderImageCanvas.toBlob(resolve));
    const url = URL.createObjectURL(blob);

    const tileTexture = new Image();
    tileTexture.src = url;
    return tileTexture;
  }

  private frameOfTile(tileId: TileId): Phaser.Textures.Frame {
    let start = this.tileset.image.firstFrame;
    let findId = -1;
    let foundKey = null;

    // TODO: rewrite this to be a bit more sane
    for (const key in this.tileset.image.frames) {
      if (findId !== -1) {
        findId++;
      }

      if (findId === -1 && start === key) {
        findId = 0;
      }

      if (findId === tileId) {
        foundKey = key;
        break;
      }
    }

    //@ts-ignore
    const frame: Phaser.Textures.Frame = this.tileset.image.frames[!foundKey ? start : foundKey];
    return frame;
  }
}
