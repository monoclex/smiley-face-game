import type { ZTileBehavior, ZTileJson } from "../types";
import type TileRegistration from "./TileRegistration";
import type Behavior from "./Behavior";
import SolidBehavior from "./SolidBehavior";
import ArrowBehavior from "./ArrowBehavior";
import GunBehavior from "./GunBehavior";

const tileBehaviorMap = {
  "solid": SolidBehavior,
  "arrow": ArrowBehavior,
  "gun": GunBehavior,
};

type BehaviorCtor = { new(tileJson: ZTileJson, registration: TileRegistration): Behavior<any> };
function justForTypeChecking(input: { [K in ZTileBehavior]: BehaviorCtor }) { }
justForTypeChecking(tileBehaviorMap);

export default tileBehaviorMap;
