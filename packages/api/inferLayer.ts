import { TileLayer } from "./types";
import TileRegistration from "./tiles/TileRegistration";

export default function inferLayer(tiles: TileRegistration, id: number): TileLayer {
  const blockInfo = tiles.for(id);
  return blockInfo.preferredLayer;
}
