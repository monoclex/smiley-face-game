import SolidBehavior from "./SolidBehavior";
import ArrowBehavior from "./ArrowBehavior";
import GunBehavior from "./GunBehavior";
import EmptyBehavior from "./EmptyBehavior";
import type { ZTileBehavior, ZTileJson } from "../types";
import type TileRegistration from "./TileRegistration";
import type Behavior from "./Behavior";
import BoostBehavior from "./BoostBehavior";
import KeysBehavior from "./KeysBehavior";
import ZoostBehavior from "./ZoostBehavior";

interface TileBehaviorConstructor {
  new (tileJson: ZTileJson, registration: TileRegistration, sourceId: number): Behavior<unknown>;
}

type TileBehaviorMap = { [K in ZTileBehavior]: TileBehaviorConstructor };

const tileBehaviorMap: TileBehaviorMap = {
  empty: EmptyBehavior,
  solid: SolidBehavior,
  arrow: ArrowBehavior,
  gun: GunBehavior,
  boost: BoostBehavior,
  keys: KeysBehavior,
  zoost: ZoostBehavior,
};

export default tileBehaviorMap;
