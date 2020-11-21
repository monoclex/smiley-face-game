import SolidBehavior from "./SolidBehavior";
import ArrowBehavior from "./ArrowBehavior";
import GunBehavior from "./GunBehavior";
import EmptyBehavior from "./EmptyBehavior";

const tileBehaviorMap = {
  "empty": EmptyBehavior,
  "solid": SolidBehavior,
  "arrow": ArrowBehavior,
  "gun": GunBehavior,
};

export default tileBehaviorMap;
