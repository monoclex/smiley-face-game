import type Behavior from "./tiles/Behavior";
import { TileLayer } from "./types";
import EmptyBehavior from "./tiles/EmptyBehavior";
import GunBehavior from "./tiles/GunBehavior";
import ArrowBehavior from "./tiles/ArrowBehavior";
import SolidBehavior from "./tiles/SolidBehavior";
import BoostBehavior from "./tiles/BoostBehavior";

export default function inferLayer(behavior: Behavior<unknown>): TileLayer {
  if (behavior instanceof EmptyBehavior) return TileLayer.Foreground; // best guess
  if (behavior instanceof SolidBehavior) return TileLayer.Foreground;
  if (behavior instanceof GunBehavior) return TileLayer.Action;
  if (behavior instanceof ArrowBehavior) return TileLayer.Action;
  if (behavior instanceof BoostBehavior) return TileLayer.Action;
  throw new Error("can't infer tile layer " + behavior);
}
