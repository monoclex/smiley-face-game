import TileRegistration from "./TileRegistration";
import Tiles from "./register";

/**
 * Creates a `TileRegistration` instance (legacy method)
 * @returns {TileRegistration} The tile registration instance to use to refer to whenever it is necessary to figure out the ID
 * or texture of a tile.
 */
function createRegistration(): TileRegistration;

/** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
function createRegistration(): TileRegistration {
  return Tiles.make();
}

export default createRegistration;
