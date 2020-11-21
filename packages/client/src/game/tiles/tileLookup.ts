import EmptyTiles from "./EmptyTiles";
import SolidTiles from "./SolidTiles";
import GunTiles from "./GunTiles";
import ArrowTiles from "./ArrowTiles";

const tileLookup = {
  ["empty"]: new EmptyTiles(),
  ["solid"]: new SolidTiles(),
  ["gun"]: new GunTiles(),
  ["arrow"]: new ArrowTiles(),
};

export default tileLookup;
