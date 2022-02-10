import Schema, { SchemaInput, string, array } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { GenericRegistration, registrations } from "./Registrations";

const key = "solid" as const;
let _: keyof typeof registrations = key;

export const zRegisterSolid = addParse(
  Schema({
    behavior: key,
    /** The name of each tile pack. Typically this will prefix each tile in the pack, e.g. basic-red, basic-green */
    name: string,
    /**
     * Multi-purpose array of tiles. Each string corresponds to its tile name, e.g. `red`, `blue`, and will get
     * appended to `name` to get its texture (e.g. `basic`-`red`). The order the tiles are in also serve to determine
     * the numeric order (unless overridden in `numerics`)
     */
    tiles: array.of(string),
    /**
     * Used in serialization for solid behavior. The index a tile is in represents its numeric position. If not specified,
     * `tiles` can be used for the same thing, but in the future if `tiles` is reordered, it'd be necessary to update
     * `numerics` so that worlds stored in the DB maintain backwards compatibility.
     *
     * Because, in the future, it may be desirable to remove blocks and replace them with others, this supports the syntax
     * `numerics: ["a", "b", ["c", "d"]] where `c` and `d` would map onto the same id. Because `c` is first, that would be
     * the texture/tile used and everything would map onto it.
     */
    numerics: array.of(Schema.either(string, array.of(string))).optional(),
  })
);
export type ZRegisterSolid = SchemaInput<typeof zRegisterSolid>;

export function registerSolid(mgr: GenericRegistration, { name, tiles, numerics }: ZRegisterSolid) {
  if (numerics)
    throw new Error("`numerics` isn't supported at this time, i haven't coded support for 'em yet");

  const storing = new SourceAndIdStorage(mgr.sourceId);
  const preferredLayer = TileLayer.Foreground;

  const blocks = mgr.registerMany(tiles, (tile) => ({
    textureId: `${name}-${tile}`,
    storing,
    preferredLayer,
  }));
  storing.connectMany(blocks);

  mgr.pack({
    name,
    blocks,
  });
}
