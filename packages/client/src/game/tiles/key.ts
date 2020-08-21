import TileAtlasType from "./TileAtlasType";

export default function key(tileAtlasType: TileAtlasType): string {
  return "atlas-" + tileAtlasType;
}
