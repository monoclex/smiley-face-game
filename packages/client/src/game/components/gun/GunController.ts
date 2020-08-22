export default interface GunController {
  isHeld: boolean;
  isFiring: boolean;
  angle: number;
  // TODO: waited sounds weird
  /** The number of milliseconds that will be waited before each bullet is shot. */
  fireRate: number;
  /** The number of milliseconds a given bullet will live for. */
  bulletLife: number;
}