import atlasJson from "../assets/atlas_atlas.json";

export default function findTexture(textureName: string) {
  for (const frame of atlasJson.frames) {
    if (frame.filename === textureName) return frame;
  }

  throw new Error(`couldn't find texture '${textureName}'`);
}
