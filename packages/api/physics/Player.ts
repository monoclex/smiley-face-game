import { Inputs } from "../game/Inputs";
import { ZSTeleportPlayer } from "../packets";
import { ComplexBlockBehavior } from "../tiles/register";
import { ZHeap, ZKeyKind, ZRole } from "../types";
import { Config } from "./Config";
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

  get sfgPosition(): Vector {
    return Vector.mults(this.position, 2);
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

  handleTeleport(event: ZSTeleportPlayer) {
    this.position = event.position;

    if (event.velocity) {
      this.velocity = event.velocity;
    }
  }

  /** @version eephysics This may be removed when the physics engine changes */
  get worldPosition(): Vector {
    return new Vector((this.x + 8) >> 4, (this.y + 8) >> 4);
    // return Vector.round(Vector.divs(this.position, 16));
  }

  set worldPosition(v: Vector) {
    this.position = Vector.mults(v, Config.blockSize);
  }

  /** @version eephysics This may be removed when the physics engine changes */
  lastBlockIn: Vector = Vector.NegativeOnes;

  /** @version eephysics This may be removed when the physics engine changes */
  lastNear: [Vector, ComplexBlockBehavior, number, ZHeap][] = [];

  /** @version eephysics This may be removed when the physics engine changes */
  private inGodMode = false;

  /** @version eephysics This may be removed when the physics engine changes */
  get isInGodMode(): boolean {
    return this.inGodMode;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  set isInGodMode(flag: boolean) {
    this.inGodMode = flag;
  }

  /** @version eephysics This may be removed when the physics engine changes */
  toggleGodMode() {
    this.isInGodMode = !this.isInGodMode;
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
  velocity: Vector = Vector.Zero;
  /** @version eephysics This may be removed when the physics engine changes */
  position: Vector = Vector.SPAWN_LOCATION;
  /** @version eephysics This may be removed when the physics engine changes */
  ticks = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  lastJump = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  jumpCount = 0;
  /** @version eephysics This may be removed when the physics engine changes */
  get x(): number {
    return this.position.x;
  }
  /** @version eephysics This may be removed when the physics engine changes */
  set x(x: number) {
    this.position = Vector.mutateX(this.position, x);
  }
  /** @version eephysics This may be removed when the physics engine changes */
  get y(): number {
    return this.position.y;
  }
  /** @version eephysics This may be removed when the physics engine changes */
  set y(y: number) {
    this.position = Vector.mutateY(this.position, y);
  }
  /** @version eephysics This may be removed when the physics engine changes */
  jumpTimes: "none" | "once" | "many" = "none";
  /** @version eephysics This may be removed when the physics engine changes */
  maxJumps = 1;
  /** @version eephysics This may be removed when the physics engine changes */
  jumpMult = 1;
  /** @version eephysics This may be removed when the physics engine changes */
  queue: [number, number] = [0, 0];
  /** @version eephysics This may be removed when the physics engine changes */
  get center(): Vector {
    // TODO: don't hardcode 16
    return Vector.adds(this.position, 8);
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
  revive(at?: Vector) {
    this.velocity = Vector.Zero;
    this.isDead = false;
    this.queue = [0, 0];

    if (at) {
      this.position = Vector.mults(at, Config.blockSize);
    }
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
  keys = new PlayerKeys();
}

// overrides for key collision, cuz when we're in a key gate but the key turns off
// we still wanna collide with key doors and not collide with gates n stuff
class PlayerKeys {
  state: Partial<Record<ZKeyKind, boolean>> = {};
  numIn: Partial<Record<ZKeyKind, number>> = {};

  clear() {
    this.state = {};
    this.numIn = {};
  }

  removeCollision(key: ZKeyKind) {
    delete this.state[key];
  }

  setCollision(key: ZKeyKind, on: boolean) {
    this.state[key] = on;
  }

  getCollision(key: ZKeyKind): boolean | undefined {
    return this.state[key];
  }

  setCountIn(key: ZKeyKind, countIn: number) {
    this.numIn[key] = countIn;
  }

  getCountIn(key: ZKeyKind): number {
    return this.numIn[key] ?? 0;
  }
}
