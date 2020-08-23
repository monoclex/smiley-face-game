export default interface GunBreed {
  /** The amount of milliseconds that have to be waited before being able to fire again. */
  firingRate: number;
  /** The amoutn of milliseconds before a bullet will despawn. */
  bulletLife: number;
}
