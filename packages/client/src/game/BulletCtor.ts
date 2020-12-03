import Bullet from "./Bullet";

export default interface BulletCtor {
  new (x: number, y: number, angle: number): Bullet;
}
