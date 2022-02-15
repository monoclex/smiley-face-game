import { Texture } from "pixi.js";
import Resolver from "./Resolver";

interface TextureConfig {
  name: string;
  url: string;
}

/**
 * Resolves strings to textures
 */
export default class TextureResolver implements Resolver {
  static async new(...textureConfigs: TextureConfig[]) {
    const textures: Map<string, Texture> = new Map();

    const textureMaps = await Promise.all(
      textureConfigs.map(async ({ name, url }) => {
        const texture = await Texture.fromURL(url);
        return { name, texture };
      })
    );

    for (const { name, texture } of textureMaps) {
      if (textures.has(name)) {
        throw new Error(`Duplicate texture ${name} detected.`);
      }

      textures.set(name, texture);
    }

    return new TextureResolver(textures);
  }

  private constructor(private readonly textures: Map<string, Texture>) {}

  get(name: string): Texture | undefined {
    return this.textures.get(name);
  }
}
