import { Vector } from "@smiley-face-game/api/physics/Vector";
import { Texture } from "pixi.js";
import { cloneTexture } from "../BlockTextureToImage";
import Resolver from "./Resolver";

type RotationJson = RotationConfig[];

interface RotationConfig {
  source: string;
  destinations: Destination[];
}

type Destination = RotationDestination | ShiftDestination;

interface RotationDestination {
  target: string;
  direction: Direction;
}

interface ShiftDestination {
  target: string;
  shift: Shift;
}

type Direction = "90 clockwise" | "90 counterclockwise" | "180" | "0";
type Shift = "none" | "half down" | "half right";

// http://scottmcdonnell.github.io/pixi-examples/index.html?s=demos&f=texture-rotate.js&title=Texture%20Rotate
const dirsToRotate: { [K in Direction]: number } = {
  "0": 0,
  "180": 4,
  "90 clockwise": 6,
  "90 counterclockwise": 2,
};

const offsetsToShift: Record<Shift, Vector> = {
  none: Vector.Zero,
  "half down": new Vector(0, 16),
  "half right": new Vector(16, 0),
};

/**
 * Will rotate a texture and give it a name.
 */
export default class RotationResolver implements Resolver {
  static async new(rotationJson: RotationJson, sourceResolver: Resolver) {
    const textures: Map<string, Texture> = new Map();

    for (const { source, destinations } of rotationJson) {
      const sourceTexture = sourceResolver.get(source);

      if (!sourceTexture) {
        throw new Error(`Error rotating texture ${source}: could not resovle texture.`);
      }

      for (const destination of destinations) {
        if (textures.has(destination.target)) {
          throw new Error(`Duplicate rotation texture ${destination.target} detected.`);
        }

        if ("direction" in destination) {
          const rotatedTexture = sourceTexture.clone();
          rotatedTexture.rotate = dirsToRotate[destination.direction];

          // fully clone the texture because the pixi tilemap render can't handle
          // a `.rotate` property
          const clonedTexture = await cloneTexture((sprite) => (sprite.texture = rotatedTexture));

          rotatedTexture.destroy(false);

          textures.set(destination.target, clonedTexture);
        } else {
          const offset = offsetsToShift[destination.shift];

          // fully clone the texture because the pixi tilemap render can't handle
          // a `.rotate` property
          const clonedTexture = await cloneTexture((sprite) => {
            sprite.texture = sourceTexture;
            sprite.x += offset.x;
            sprite.y += offset.y;
          });

          textures.set(destination.target, clonedTexture);
        }
      }
    }

    // so apparently the last texture of rotated resolver doesn't get saved... or something?
    // so here we clone a texture to simulate some work which somehow fixes it?
    // idk man
    await cloneTexture(() => {
      // do nothing lol
    });

    return new RotationResolver(textures);
  }

  private constructor(private readonly textures: Map<string, Texture>) {}

  get(name: string): Texture | undefined {
    return this.textures.get(name);
  }
}
