import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { Texture, Rectangle } from "pixi.js";
import player from "../assets/base.png";
import bullet from "../assets/bullet.png";
import atlas from "../assets/atlas.png";
import select from "../assets/select.png";
import gun from "../assets/held_gun.png";
import smile from "../assets/smile.png";
import findTexture from "./atlasFindFrame";

// add textures here
const textureDef = {
  player,
  bullet,
  atlas,
  select,
  gun,
  smile,
} as const;

class TexturesObject<T extends { atlas: string }> {
  private readonly _storage: Map<keyof T, Texture> = new Map();
  private readonly _blockCache: Map<string, Texture> = new Map();

  private _tileJson?: TileRegistration;
  get tileJson(): TileRegistration {
    if (!this._tileJson) throw new Error(`'tileJson' not loaded`);
    return this._tileJson;
  }

  constructor(private readonly _definitions: T) {}

  get(name: keyof T): Texture {
    const texture = this._storage.get(name);
    if (texture === undefined) throw new Error(`'${name}' not loaded`);
    return texture;
  }

  load(tileJson: TileRegistration): Promise<void[]> {
    this._tileJson = tileJson;

    return Promise.all(
      Object.entries(this._definitions).map(([key, url]) =>
        Texture.fromURL(url).then((texture) => {
          this._storage.set(key as keyof T, texture);
        })
      )
    );
  }

  block(name: number | string): Texture {
    if (typeof name === "number") {
      return this.block(this.tileJson.texture(name));
    }

    const blockCacheResult = this._blockCache.get(name);
    if (blockCacheResult !== undefined) {
      return blockCacheResult;
    }

    const { x, y, w, h } = findTexture(name).frame;

    const texture = new Texture(this.get("atlas").baseTexture, new Rectangle(x, y, w, h));
    this._blockCache.set(name, texture);

    return texture;
  }
}

export default new TexturesObject(textureDef);
