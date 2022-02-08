import { TileLayer } from "./types";
import EmptyBehavior from "./tiles/EmptyBehavior";
import GunBehavior from "./tiles/GunBehavior";
import ArrowBehavior from "./tiles/ArrowBehavior";
import SolidBehavior from "./tiles/SolidBehavior";
import BoostBehavior from "./tiles/BoostBehavior";
import KeysBehavior from "./tiles/KeysBehavior";
import ZoostBehavior from "./tiles/ZoostBehavior";
import TileRegistration from "./tiles/TileRegistration";

export default function inferLayer(tiles: TileRegistration, id: number): TileLayer {
  const behavior = tiles.for(id);
  if (behavior instanceof EmptyBehavior) return TileLayer.Foreground; // best guess
  if (behavior instanceof SolidBehavior) return TileLayer.Foreground;
  if (behavior instanceof GunBehavior) return TileLayer.Action;
  if (behavior instanceof ArrowBehavior) return TileLayer.Action;
  if (behavior instanceof BoostBehavior) return TileLayer.Action;
  if (behavior instanceof KeysBehavior) {
    if (tiles.texture(id) === "keys-red-key") return TileLayer.Action;
    else return TileLayer.Foreground;
  }
  if (behavior instanceof ZoostBehavior) return TileLayer.Action;
  throw new Error("can't infer tile layer " + behavior);
}
