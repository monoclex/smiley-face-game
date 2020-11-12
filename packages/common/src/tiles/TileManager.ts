import type { ZTileJsonFile } from "../types";
import { zTileJsonFile } from "../types";
import tileBehaviorMap from "./behaviors";
import TileRegistration from "./TileRegistration";

/**
 * Goes over a tile json file, and registers all tiles as necessary.
 * @param tileJsonFile The tile json file to register.
 * @returns {TileRegistration} The tile registration instance to use to refer to whenever it is necessary to figure out the ID
 * or texture of a tile.
 */
export default function createRegistration(tileJsonFile: ZTileJsonFile): TileRegistration;

/** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
export default function createRegistration(argTileJsonFile: unknown): TileRegistration {
  const tileJsonFile = zTileJsonFile.parse(argTileJsonFile);
  const registration = new TileRegistration();

  let sourceId = 0;
  for (const tileJson of tileJsonFile) {
    const behaviorCtor = tileBehaviorMap[tileJson.behavior];

    // constructing this should register the tiles as necessary. a bit weird to read yeah, but w/e
    //@ts-ignore
    const behavior = new behaviorCtor(tileJson, sourceId++, registration);
  }

  return registration;
}
