import Position from "./Position";
import Velocity from "./Velocity";
import Game from "./Game";

export default interface PhysicsObject {
  position: Position;
  velocity: Velocity;
  tick?: (game: Game) => void;
}
