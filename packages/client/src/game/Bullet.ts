import Position from "./interfaces/Position";
import Velocity from "./interfaces/Velocity";
import PhysicsObject from "./interfaces/PhysicsObject";

export default class Bullet implements PhysicsObject {
  creation: Date = new Date();
  position: Position;
  velocity: Velocity;

  constructor(x: number, y: number, angle: number) {
    const startingPower = 32;
    this.position = { x, y };
    this.velocity = {
      x: Math.cos(angle) * startingPower,
      y: Math.sin(angle) * startingPower,
    };
  }

  tick() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  cleanup() {}
}
