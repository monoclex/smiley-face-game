import type { ZTileJsonFile } from "../types";
import { zTileJsonFile } from "../types";
import TileRegistration, { NewTileRegistration } from "./TileRegistration";
import { registrations } from "./registration/Registrations";

/**
 * Goes over a tile json file, and registers all tiles as necessary.
 * @param tileJsonFile The tile json file to register.
 * @returns {TileRegistration} The tile registration instance to use to refer to whenever it is necessary to figure out the ID
 * or texture of a tile.
 */
function createRegistration(tileJsonFile: ZTileJsonFile): TileRegistration;

/** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
function createRegistration(argTileJsonFile: unknown): TileRegistration {
  const tileJsonFile = zTileJsonFile.parse(argTileJsonFile);
  const registerer = new NewTileRegistration();

  let sourceId = 0;
  for (const tileJson of tileJsonFile) {
    registerer._sourceId = sourceId;

    // @ts-expect-error there's no way i can type this right to typescript, but it's right
    registrations[tileJson.behavior](registerer, tileJson);

    sourceId += 1;
  }

  registrations["empty"](registerer, { behavior: "empty" });
  return new TileRegistration(registerer);
}

export default createRegistration;
