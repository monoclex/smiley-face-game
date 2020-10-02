import { TileId } from "@smiley-face-game/api/schemas/TileId";
import Tile from "./Tile";
import EmptyTile from "./EmptyTile";
import FullTile from "./FullTile";
import GunTile from "./GunTile";
import ArrowTile from "./ArrowTile";

const tileLookup = {
  [TileId.Empty]: new EmptyTile(),
  [TileId.Full]: new FullTile(),
  [TileId.Gun]: new GunTile(),
  [TileId.Arrow]: new ArrowTile(),
};

function ensureTypeChecked(lookup: { [key in TileId]: Tile<key> }) {}
ensureTypeChecked(tileLookup);

export default tileLookup;
