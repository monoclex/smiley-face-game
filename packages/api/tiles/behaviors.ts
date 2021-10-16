import SolidBehavior from "./SolidBehavior";
import ArrowBehavior from "./ArrowBehavior";
import GunBehavior from "./GunBehavior";
import EmptyBehavior from "./EmptyBehavior";
import type { ZTileJson } from "../types";
import type TileRegistration from "./TileRegistration";
import type Behavior from "./Behavior";

interface TileBehaviorConstructor {
  new (tileJson: ZTileJson, registration: TileRegistration, sourceId: number): Behavior<unknown>;
}

type TileBehaviorMap = { [K in "empty" | "solid" | "arrow" | "gun"]: TileBehaviorConstructor };

const tileBehaviorMap: TileBehaviorMap = {
  empty: EmptyBehavior,
  solid: SolidBehavior,
  arrow: ArrowBehavior,
  gun: GunBehavior,
};

export default tileBehaviorMap;
