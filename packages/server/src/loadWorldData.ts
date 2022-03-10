import { Vector } from "@smiley-face-game/api/physics/Vector";
import { FormatLoader } from "@smiley-face-game/api/tiles/format/FormatLoader";
import { loadWorldVersion0 } from "@smiley-face-game/api/tiles/format/WorldDataVersion0";
import { loadWorldVersion1 } from "@smiley-face-game/api/tiles/format/WorldDataVersion1";
import { loadWorldVersion2 } from "@smiley-face-game/api/tiles/format/WorldDataVersion2";
import tiles from "./tiles";

export default function loadWorldData(worldSize: Vector, worldData: HostWorldData) {
  const formatLoader = new FormatLoader(tiles, worldSize);

  if (worldData.worldDataVersion === 0) {
    loadWorldVersion0(formatLoader, JSON.parse(worldData.worldData));
  } else if (worldData.worldDataVersion === 1) {
    loadWorldVersion1(formatLoader, JSON.parse(worldData.worldData));
  } else if (worldData.worldDataVersion === 2) {
    loadWorldVersion2(formatLoader, JSON.parse(worldData.worldData));
  } else {
    throw new Error("Unknown world version");
  }
  return formatLoader;
}
