import { Behavior } from "../../tiles/register";
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

  isHazard(id: number) {
    return this.tiles.tryForId(id)?.behavior === Behavior.Hazard;
  }

  isZoost(id: number) {
    return this.tiles.tryForId(id)?.behavior === Behavior.Zoost;
  }

  isBoost(id: number) {
    return this.tiles.tryForId(id)?.behavior === Behavior.Boost;
  }

  // TODO: these should be values on the blocks themselves

  /**
   * The gravitational pull of a block will not only apply a force to the player,
   * it will also determine the axis that the player is allowed to jump against.
   */
  getGraviationalPull(blockId: number) {
    return this.tiles.tryForId(blockId)?.gravitationalPull ?? Vector.Down;
  }

  zoostDirToVec(zoostId: number) {
    return this.tiles.forId(zoostId).direction;
  }

  // so basically boosts while they don't have "gravity" (so they technically
  // aren't pulling you in a direction) have an amount of force they apply instead
  // to the player.
  getRequiredForce(block: number) {
    return this.tiles.tryForId(block)?.requiredForce ?? Vector.Zero;
  }
}
