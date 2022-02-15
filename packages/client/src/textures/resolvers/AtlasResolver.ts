import { Rectangle, Texture } from "pixi.js";
import Resolver from "./Resolver";

interface AtlasJson {
  frames: Frame[];
}

interface Frame {
  filename: string;
  frame: Bounds;
  anchor: Anchor;
}

interface Anchor {
  x: number;
  y: number;
}

interface Bounds extends Anchor {
  w: number;
  h: number;
}

/**
 * Resolves a texture by name from the local atlas.
 */
export default class AtlasResolver implements Resolver {
  static new(atlasJson: AtlasJson, atlasTexture: Texture) {
    const textures: Map<string, Texture> = new Map();

    for (const { filename, frame } of atlasJson.frames) {
      const bounds = new Rectangle(frame.x, frame.y, frame.w, frame.h);

      const texture = new Texture(atlasTexture.baseTexture, bounds);

      if (textures.has(filename)) {
        throw new Error(`Duplicate texture ${filename} detected.`);
      }

      textures.set(filename, texture);
    }

    return new AtlasResolver(textures);
  }

  private constructor(private readonly textures: Map<string, Texture>) {}

  get(name: string): Texture | undefined {
    return this.textures.get(name);
  }
}
