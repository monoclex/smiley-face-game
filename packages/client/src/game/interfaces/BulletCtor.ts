import Bullet from "../components/Bullet";

export default interface BulletCtor {
  new (x: number, y: number, angle: number): Bullet;
}
