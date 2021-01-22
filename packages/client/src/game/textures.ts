import { Texture, Rectangle } from "pixi.js";
import playerUrl from "../assets/base.png";
import bulletUrl from "../assets/bullet.png";
import atlasUrl from "../assets/atlas.png";
import selectUrl from "../assets/select.png";
import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import atlasJson from "../assets/atlas_atlas.json";
import gunUrl from "../assets/held_gun.png";
import smileUrl from "../assets/smile.png";

const textures = new (class {
  private _tileJson: TileRegistration | undefined;
  get tileJson(): TileRegistration {
    if (!this._tileJson) throw new Error("`tileJson` not loaded");
    return this._tileJson;
  }

  private _bullet: Texture | undefined;
  get bullet(): Texture {
    if (!this._bullet) throw new Error("`bullet` texture not loaded");
    return this._bullet;
  }

  private _player: Texture | undefined;
  get player(): Texture {
    if (!this._player) throw new Error("`player` texture not loaded");
    return this._player;
  }

  private _atlas: Texture | undefined;
  get atlas(): Texture {
    if (!this._atlas) throw new Error("`atlas` texture not loaded");
    return this._atlas;
  }

  private _select: Texture | undefined;
  get select(): Texture {
    if (!this._select) throw new Error("`select` texture not loaded");
    return this._select;
  }

  private _gun: Texture | undefined;
  get gun(): Texture {
    if (!this._gun) throw new Error("`gun` texture not loaded");
    return this._gun;
  }

  private _smile: Texture | undefined;
  get smile(): Texture {
    if (!this._smile) throw new Error("`smile` texture not loaded");
    return this._smile;
  }

  private readonly _blockCache: Map<string, Texture> = new Map();
  block(name: number | string): Texture {
    if (typeof name === "number") {
      return this.block(this.tileJson.texture(name));
    }

    const blockCacheResult = this._blockCache.get(name);
    if (blockCacheResult !== undefined) {
      return blockCacheResult;
    }

    // TODO: move atlas json stuff to its own component
    for (const frame of atlasJson.frames) {
      if (frame.filename === name) {
        const texture = new Texture(
          this.atlas.baseTexture,
          new Rectangle(frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h)
        );
        this._blockCache.set(name, texture);
        return texture;
      }
    }
    throw new Error("couldn't find texture " + name);
  }

  load(tileJson: TileRegistration): Promise<void> {
    //@ts-ignore
    window.HACK_FIXME_LATER_tileJson = tileJson;
    this._tileJson = tileJson;
    return Promise.all([playerUrl, bulletUrl, atlasUrl, selectUrl, gunUrl, smileUrl])
      .then((urls) => Promise.all(urls.map(Texture.fromURL)))
      .then(([player, bullet, atlas, select, gun, smile]) => {
        this._player = player;
        this._bullet = bullet;
        this._atlas = atlas;
        this._select = select;
        this._gun = gun;
        this._smile = smile;
      });
  }
})();
export default textures;
