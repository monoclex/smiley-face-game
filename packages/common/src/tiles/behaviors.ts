import SolidBehavior from "./SolidBehavior";
import ArrowBehavior from "./ArrowBehavior";
import GunBehavior from "./GunBehavior";

const tileBehaviorMap = {
  "solid": SolidBehavior,
  "arrow": ArrowBehavior,
  "gun": GunBehavior,
};

export default tileBehaviorMap;
