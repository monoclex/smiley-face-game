import { Inputs } from "../game/Inputs";
import { ZRole } from "../types";
import { Config } from "./ee/Config";
import { ArrowDirection } from "./ee/Directions";
import { Vector } from "./Vector";

// regarding physics variables:
// i would *love* to use traits to make the `Player` class
// have a generic `state:` container so any physics engine
// can shove their state there, and the same player class
// could get reused amongst physics engines. but, the amount
// of generic boilerplate and hell far outweighs the benefits
// right now. and since we only have one physics engine, i
// think it's fine to shove all physics state into the player
// without regard.

export interface CheapPlayer {
  id: number;
  role: ZRole;
  username: string;
  canGod: boolean;
}

export class Player {
  input: Inputs;

  get velocity(): Vector {
    return { x: this.speedX, y: this.speedY };
  }

  set velocity(v: Vector) {
    this.speedX = v.x;
    this.speedY = v.y;
  }

  get position(): Vector {
    return { x: this.x * 2, y: this.y * 2 };
  }

  set position(v: Vector) {
    this.x = v.x / 2;
    this.y = v.y / 2;
  }

  get hasEdit(): boolean {
    return this.role !== "non";
  }

  constructor(
    readonly id: number,
    readonly name: string,
    public role: ZRole,
    readonly isGuest: boolean,
    position: Vector,
    public canGod: boolean,
    inGod: boolean
  ) {
    this.input = {
      up: false,
      left: false,
      down: false,
      right: false,
      jump: false,
    };

    this.position = position;

    this.isInGodMode = inGod;
  }

  cheap(): CheapPlayer {
    return { id: this.id, role: this.role, username: this.name, canGod: this.canGod };
  }

  /** @version eephysics This may be removed when the physics engine changes */
  get worldPosition(): Vector {
    return Vector.round(Vector.divs(new Vector(this.x, this.y), 16));
  }

  /** @version eephysics This may be removed when the physics engine changes */
  private inGodMode = false;

  /** @version eephysics This may be removed when the physics engine changes */
  get isInGodMode(): boolean {
    return this.inGodMode;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  set isInGodMode(flag: boolean) {
    this.inGodMode = flag;
    if (this.inGodMode) {
      this.resetModifiers();
    }
  }

  /** @version eephysics This may be removed when the physics engine changes */
  toggleGodMode() {
    this.isInGodMode = !this.isInGodMode;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  resetModifiers() {
    this.origModX = 0;
    this.origModY = 0;
    this.modX = 0;
    this.modY = 0;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  horizontal = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  vertical = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  isSpaceDown = false;
  /** @version eephysics This may be removed when the physics engine changes */
  isSpaceJustPressed = false;
  /** @version eephysics This may be removed when the physics engine changes */
  speedMult = 1;
  /** @version eephysics This may be removed when the physics engine changes */
  gravityMult = 1;
  /** @version eephysics This may be removed when the physics engine changes */
  speedX = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  speedY = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  x = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  y = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  ticks = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  lastJump = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  jumpCount = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  maxJumps = 1;
  /** @version eephysics This may be removed when the physics engine changes */
  jumpMult = 1;
  /** @version eephysics This may be removed when the physics engine changes */
  moving = false;
  /** @version eephysics This may be removed when the physics engine changes */
  queue: [number, number] = [0, 0];
  /** @version eephysics This may be removed when the physics engine changes */
  origModX = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  origModY = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  modX = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  modY = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  insideRedKey = false;
  /** @version eephysics This may be removed when the physics engine changes */
  insideKeyBlock = [false, false];
  /** @version eephysics This may be removed when the physics engine changes */
  get center(): Vector {
    // TODO: don't hardcode 16
    return Vector.adds(this.position, 16);
  }
  /** @version eephysics This may be removed when the physics engine changes */
  get centerEE(): Vector {
    return Vector.divs(this.center, 2);
  }
  /** @version eephysics This may be removed when the physics engine changes */
  insideSign: false | Vector = false;

  /** @version eephysics This may be removed when the physics engine changes */
  deathTick: number = 0;

  /** @version eephysics This may be removed when the physics engine changes */
  get isDead(): boolean {
    return this.deathTick !== 0;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  set isDead(value: boolean) {
    this.deathTick = value ? this.ticks : 0;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  kill() {
    if (!this.isDead) {
      this.isDead = true;
    }
  }

  /**
   * Revives the player at a certain position (in block coordinates)
   * @version eephysics This may be removed when the physics engine changes
   */
  revive(at: Vector) {
    this.modX = 0;
    this.modY = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.isDead = false;
    this.queue = [0, 0];

    // TODO: don't hardcode 32x32 world
    this.position = Vector.mults(at, 32);
  }

  shouldBeRevived(ticksAfterDeath: number): boolean {
    return this.ticks >= this.deathTick + ticksAfterDeath;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  checkpoint: Vector | null = null;

  /** @version eephysics This may be removed when the physics engine changes */
  get hasCheckpoint(): boolean {
    return this.checkpoint !== null;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  clearCheckpoint() {
    this.checkpoint = null;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  zoostQueue: Vector[] = [];

  /** @version eephysics This may be removed when the physics engine changes */
  clearZoostQueue() {
    this.zoostQueue = [];
  }

  /** @version eephysics This may be removed when the physics engine changes */
  pushZoostQueue(direction: Vector) {
    // a totally viable implementation of this function is just
    //
    // this.zoostQueue.push(direction);
    //
    // but for performance, we don't want to push the same direction twice

    // try to peek at the top item
    const top = this.zoostQueue.pop();

    if (top != null) {
      this.zoostQueue.push(top);

      // don't push duplicate directions
      if (Vector.eq(top, direction)) return;
    }

    // either nothing at the top or not a duplicate, push it
    this.zoostQueue.push(direction);
  }
}
