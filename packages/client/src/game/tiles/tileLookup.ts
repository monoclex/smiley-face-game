import { TileId } from "@smiley-face-game/schemas/TileId";
import Tile from "./Tile";
import EmptyTile from "./EmptyTile";
import FullTile from "./FullTile";
import GunTile from "./GunTile";
import ArrowTile from "./ArrowTile";
import PrismarineTile from "./PrismarineTile";

const tileLookup = {
  [TileId.Empty]: new EmptyTile(),
  [TileId.Basic]: new FullTile(),
  [TileId.Gun]: new GunTile(),
  [TileId.Arrow]: new ArrowTile(),
  [TileId.Prismarine]: new PrismarineTile(),
};

function ensureTypeChecked(_: { [key in TileId]: Tile<key> }) { }
ensureTypeChecked(tileLookup);

export default tileLookup;
