import Position from "../../../math/Position";
import BulletType from "./BulletType";

export default interface BulletConfig {
  readonly bulletType?: BulletType;
  readonly position: Position;
  readonly angle: number;
  readonly lifetime: number;
}
