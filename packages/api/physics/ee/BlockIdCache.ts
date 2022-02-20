import TileRegistration from "../../tiles/TileRegistration";
import { Vector } from "../Vector";

export class BlockIdCache {
  readonly dot: number;
  readonly arrowUp: number;
  readonly arrowRight: number;
  readonly arrowDown: number;
  readonly arrowLeft: number;
  readonly boostUp: number;
  readonly boostRight: number;
  readonly boostDown: number;
  readonly boostLeft: number;
  readonly zoostUp: number;
  readonly zoostRight: number;
  readonly zoostDown: number;
  readonly zoostLeft: number;
  readonly keysRedKey: number;
  readonly keysRedGate: number;
  readonly keysRedDoor: number;
  readonly gun: number;
  readonly sign: number;
  readonly spikeUp: number;
  readonly spikeRight: number;
  readonly spikeDown: number;
  readonly spikeLeft: number;
  readonly checkpoint: number;

  constructor(readonly tiles: TileRegistration) {
    this.dot = tiles.id("dot");
    this.arrowUp = tiles.id("arrow-up");
    this.arrowRight = tiles.id("arrow-right");
    this.arrowDown = tiles.id("arrow-down");
    this.arrowLeft = tiles.id("arrow-left");
    this.boostUp = tiles.id("boost-up");
    this.boostRight = tiles.id("boost-right");
    this.boostDown = tiles.id("boost-down");
    this.boostLeft = tiles.id("boost-left");
    this.zoostUp = tiles.id("zoost-up");
    this.zoostRight = tiles.id("zoost-right");
    this.zoostDown = tiles.id("zoost-down");
    this.zoostLeft = tiles.id("zoost-left");
    this.keysRedKey = tiles.id("keys-red-key");
    this.keysRedGate = tiles.id("keys-red-gate");
    this.keysRedDoor = tiles.id("keys-red-door");
    this.gun = tiles.id("gun");
    this.sign = tiles.id("sign");
    this.spikeUp = tiles.id("spike-up");
    this.spikeRight = tiles.id("spike-right");
    this.spikeDown = tiles.id("spike-down");
    this.spikeLeft = tiles.id("spike-left");
    this.checkpoint = tiles.id("checkpoint");
  }

  isSpikes(id: number) {
    return (
      id == this.spikeUp || id == this.spikeRight || id == this.spikeDown || id == this.spikeLeft
    );
  }

  isZoost(id: number) {
    return (
      id == this.zoostUp || id == this.zoostRight || id == this.zoostDown || id == this.zoostLeft
    );
  }

  isBoost(id: number) {
    return (
      id == this.boostUp || id == this.boostRight || id == this.boostLeft || id == this.boostDown
    );
  }

  // TODO: these should be values on the blocks themselves

  /**
   * The gravitational pull of a block will not only apply a force to the player,
   * it will also determine the axis that the player is allowed to jump against.
   */
  getGraviationalPull(blockId: number) {
    // boosts (and dots) are considered to have no gravitational pull
    // as we do not want to allow the player to jump in any axis.
    switch (blockId) {
      case this.boostUp:
      case this.boostRight:
      case this.boostLeft:
      case this.boostDown:
        return Vector.Zero;

      case this.arrowUp:
        return Vector.Up;
      case this.arrowRight:
        return Vector.Right;
      case this.arrowLeft:
        return Vector.Left;
      case this.arrowDown:
        return Vector.Down;

      case this.dot:
        return Vector.Zero;

      // TODO(feature-gravity-effect): change default direction depending upon
      //   gravity effect direction
      default:
        return Vector.Down;
    }
  }

  zoostDirToVec(zoostId: number) {
    switch (zoostId) {
      case this.zoostUp:
        return Vector.Up;
      case this.zoostRight:
        return Vector.Right;
      case this.zoostDown:
        return Vector.Down;
      case this.zoostLeft:
        return Vector.Left;
      default:
        throw new Error("called `zoostDirToVec` without zoost");
    }
  }

  // so basically boosts while they don't have "gravity" (so they technically
  // aren't pulling you in a direction) have an amount of force they apply instead
  // to the player.
  getRequiredForce(block: number) {
    const MAX_SPEED = 16;

    switch (block) {
      case this.boostUp:
        return Vector.mults(Vector.Up, MAX_SPEED);
      case this.boostRight:
        return Vector.mults(Vector.Right, MAX_SPEED);
      case this.boostDown:
        return Vector.mults(Vector.Down, MAX_SPEED);
      case this.boostLeft:
        return Vector.mults(Vector.Left, MAX_SPEED);
      default:
        return Vector.Zero;
    }
  }
}
