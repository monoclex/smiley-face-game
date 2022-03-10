import { FormatLoader } from "@smiley-face-game/api/tiles/format/FormatLoader";
import { saveWorldVersion2 } from "@smiley-face-game/api/tiles/format/WorldDataVersion2";
import { TileLayer } from "@smiley-face-game/api/types";
import tiles from "./tiles";

export function generateBlankWorld(width: number, height: number): HostWorldData {
  const formatLoader = new FormatLoader(tiles, { x: width, y: height });

  formatLoader.world.putBorder(width, height, TileLayer.Foreground, tiles.id("basic-white"));

  const serialized = JSON.stringify(saveWorldVersion2(formatLoader));
  return { worldDataVersion: 2, worldData: serialized };
}
