import TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { Texture, Rectangle } from "pixi.js";
import player from "../assets/base.png";
import bullet from "../assets/bullet.png";
import atlas from "../assets/atlas.png";
import atlasJson from "../assets/atlas_atlas.json";
import rotationJson from "../assets/tiles/rotations.json";
import select from "../assets/select.png";
import gun from "../assets/held_gun.png";
import smile from "../assets/smile.png";
import defaultWings from "../assets/wings/default.png";
import TextureResolver from "../textures/resolvers/TextureResolver";
import AtlasResolver from "../textures/resolvers/AtlasResolver";
import CombinedResolver from "../textures/resolvers/CombinedResolver";
import Resolver from "../textures/resolvers/Resolver";
import RotatedResolver from "../textures/resolvers/RotatedResolver";

const textureDef = {
  player,
  bullet,
  atlas,
  select,
  gun,
  smile,
  ["wings-default"]: defaultWings,
} as const;

class TexturesObject<T extends { atlas: string }> {
  private resolver!: Resolver;
  private readonly _storage: Map<keyof T, Texture> = new Map();
  private readonly _blockCache: Map<string, Texture> = new Map();

  private _tileJson?: TileRegistration;
  get tileJson(): TileRegistration {
    if (!this._tileJson) throw new Error(`'tileJson' not loaded`);
    return this._tileJson;
  }

  constructor(private readonly _definitions: T) {}

  get(name: string): Texture {
    const texture = this.resolver.get(name);
    if (texture === undefined) throw new Error(`'${name}' not loaded`);
    return texture;
  }

  async load(tileJson: TileRegistration): Promise<void> {
    this._tileJson = tileJson;

    const textureResolver = await TextureResolver.new(
      ...Object.entries(textureDef).map(([key, value]) => ({ name: key, url: value }))
    );

    const atlas = textureResolver.get("atlas");
    if (!atlas) throw new Error("couldn't load atlas");

    const atlasResolver = AtlasResolver.new(atlasJson, atlas);

    //@ts-expect-error json files aren't `const`
    const rotationResolver = await RotatedResolver.new(rotationJson, atlasResolver);

    const resolver = new CombinedResolver(atlasResolver, rotationResolver, textureResolver);
    this.resolver = resolver;
  }

  block(name: number | string): Texture {
    if (typeof name === "number") {
      return this.block(this.tileJson.texture(name));
    }

    return this.get(name);
  }
}

export default new TexturesObject(textureDef);
