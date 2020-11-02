/**
 * @description This file will map the name of a block to its client-side ID. This is incredibly useful
 * to eliminate code redundancy. Phaser tilemaps operate with each tile having its own "ID", and its ID
 * depends on its position in the atlas. Here, we import the atlas and map the name of the tile to its
 * position in the atlas, allowing us to simply write the name of the tile, and have it automatically
 * resolve to the correct ID.
 *
 * In addition, in theory, we would get type checking whenever we supply an incorrect tile name. However,
 * typescript does not support importing json as const. https://github.com/microsoft/TypeScript/issues/32063
 */

import atlasJson from "../../assets/atlas_atlas.json";

const nameToId: { [name: string]: number } = {};
for (let i = 0; i < atlasJson.frames.length; i++) {
  nameToId[atlasJson.frames[i].filename] = i;
}
console.log(nameToId);

/**
 * Maps the string name of the tile (found in key `filename` of `atlas_atlas.json`) to the ID of the
 * tile on the client-side.
 * @param tileName The name of the tile
 * @returns The ID of the tile to use client-side.
 */
export default function mapTileNameToClientId(tileName: string): number {
  // TODO: debug assert this
  let couldFindAny = -1 !== atlasJson.frames.findIndex(({ filename }) => filename === tileName);
  if (!couldFindAny) {
    throw new Error(`Could not find tile with name '${tileName}'.`);
  }

  return nameToId[tileName];
}
