import { createNanoEvents } from "../../nanoevents";
import { Blocks } from "../../game/Blocks";
import { ZSMovement } from "../../packets";
import TileRegistration from "../../tiles/TileRegistration";
import { TileLayer } from "../../types";
import { PhysicsEvents } from "../PhysicsSystem";
import { Player } from "../Player";
import { Vector } from "../Vector";
import { BlockIdCache } from "./BlockIdCache";
import { Config } from "./Config";
import equal from "fast-deep-equal";
import { Rectangle } from "../Rectangle";
import { autoAlignVector } from "./algorithms/autoAlign";
import { calculateDragVector } from "./algorithms/calculateDrag";
import { collisionStepping } from "./algorithms/collisionStepping";
import { performJumping } from "./algorithms/jumping";
import { performZoosts } from "./algorithms/zoosts";
import { StateStorageKey } from "../../tiles/register";

// half a second until alive
const TIME_UNTIL_ALIVE = 250;

// for the reference EE physics implementation, see here:
// https://github.com/Seb-135/ee-offline/blob/main/src/Player.as
// the physics code in SFG has been completely rewritten from scratch but keeps
// all of the bugs and quirks the original EE physics code has
export class EEPhysics {
  readonly optimalTickRate: number;
  readonly events = createNanoEvents<PhysicsEvents>();

  ticks = 0;
  start = Date.now();

  private ids: BlockIdCache;

  get redKeyOn() {
    return this.collisionStates.willCollideWith("redkey", this.ticks);
  }

  collisionStates = new CollisionStates();
  collidedChanges = new DifferentialRecord<StateStorageKey, boolean>();

  private readonly ticksUntilAlive: number;

  constructor(tiles: TileRegistration, private readonly world: Blocks, ticksPerSecond: number) {
    this.optimalTickRate = 1000 / ticksPerSecond;
    this.ticksUntilAlive = TIME_UNTIL_ALIVE / this.optimalTickRate;
    this.ids = new BlockIdCache(tiles);
  }

  update(elapsedMs: number, players: Player[]) {
    while ((this.ticks + 1) * this.optimalTickRate <= elapsedMs) {
      this.tick(players);
    }
  }

  handleChangesToCollisions() {
    const changes = this.collidedChanges.update(
      this.collisionStates.getCollisionStates(this.ticks)
    );

    for (const [change, key] of changes) {
      this.events.emit("keyState", "red", this.collisionStates.willCollideWith(key, this.ticks));
    }
  }

  triggerKey(kind: "red", deactivateTime: number, player: Player): void {
    const tickDisablesAt = Math.ceil((deactivateTime - this.start) / this.optimalTickRate);
    this.collisionStates.setCollisionOffOnTick("redkey", tickDisablesAt);
  }

  updatePlayer(movement: ZSMovement, player: Player): void {
    player.position = movement.position;
    player.velocity = movement.velocity;
    player.input = movement.inputs;

    if (movement.queue.length !== 2) throw new Error("invalid movement packet");
    //@ts-expect-error doesn't coerce nicely
    player.queue = movement.queue;
  }

  tick(players: Player[]) {
    for (const player of players) {
      this.tickPlayer(player);
      player.ticks++;
    }

    this.handleChangesToCollisions();
    this.ticks += 1;
  }

  tickPlayer(player: Player) {
    const self = player;

    if (self.isInGodMode) {
      this.tickGodPlayer(self);
      return;
    }

    if (self.isDead) {
      // TODO(ee-sync): is the player allowed to move on the tick they respawn?
      if (self.shouldBeRevived(this.ticksUntilAlive)) {
        self.revive(this.getRespawnLocation(self));
      } else {
        return;
      }
    }

    const { current, delayed } = this.getPhysicsBlockOn(self);

    if (this.ids.isZoost(current)) {
      this.performZoosts(self, self.worldPosition, this.ids.zoostDirToVec(current));
      return;
    }

    if (this.ids.isHazard(current)) {
      self.kill();
      return;
    }

    let position = self.position;
    let velocity = self.velocity;

    const currentGravityDirection = this.ids.getGraviationalPull(current);
    const delayedGravityDirection = this.ids.getGraviationalPull(delayed);

    const horizontalInput = Number(self.input.right) - Number(self.input.left);
    const verticalInput = Number(self.input.down) - Number(self.input.up);
    self.isSpaceJustPressed = !self.isSpaceDown && self.input.jump;
    self.isSpaceDown = self.input.jump;

    let movementDirection = new Vector(horizontalInput, verticalInput);

    // prevent the player from moving in the direction of gravity
    movementDirection = Vector.filterOut(delayedGravityDirection, movementDirection);

    const playerForce = Vector.mults(movementDirection, self.speedMult);

    const gravity = Config.physics.gravity * self.gravityMult;
    const delayedGravityForce = Vector.mults(delayedGravityDirection, gravity);
    const currentGravityForce = Vector.mults(currentGravityDirection, gravity);

    const forceAppliedToPlayer = Vector.divs(
      Vector.add(playerForce, delayedGravityForce),
      Config.physics.variable_multiplyer
    );

    velocity = calculateDragVector(
      velocity,
      forceAppliedToPlayer,
      movementDirection,
      currentGravityDirection
    );

    // override any force calculations if we're in boosts
    const requiredForce = this.ids.getRequiredForce(current);
    velocity = Vector.substituteZeros(requiredForce, velocity);

    let {
      grounded,
      position: stepPosition,
      velocity: stepVelocity,
    } = collisionStepping(
      (position) => this.playerIsColliding(self, position),
      position,
      velocity,
      currentGravityDirection,
      this.ids.isBoost(current)
    );

    position = stepPosition;
    velocity = stepVelocity;

    velocity = performJumping(
      self,
      grounded,
      currentGravityForce,
      currentGravityDirection,
      delayedGravityDirection,
      velocity
    );

    position = autoAlignVector(position, velocity, forceAppliedToPlayer);

    self.position = position;
    self.velocity = velocity;

    this.triggerBlockAction(self);
    this.handleSurroundingBlocks(self);
  }

  /**
   * In EE physics, there is the concept of the `current` and `delayed` physics
   * blocks.
   *
   * The `current` physics block is the block you're currently standing
   * on, as of the current tick.
   *
   * The `delayed` physics block is the block you *were* standing on, as of two
   * to three ticks ago.
   */
  private getPhysicsBlockOn(self: Player) {
    // the queue `self.queue` gives the game a bouncier feel
    // if we didn't have this here, holding "up" on dots or standing on up arrows
    // would not have you swing between two blocks - you would be right on the edge
    // of the dot and the air, or the arrow and the air.
    const current = this.world.blockAt(self.worldPosition, TileLayer.Action);

    let delayed: number;
    if (current === this.ids.dot) {
      // this is here to make dots grab more
      // if you remove this, then holding up on dots will make you fall
      // this is because dots are in the queue less
      delayed = self.queue[1];
      self.queue = [current, current];
    } else {
      delayed = self.queue.shift()!;
      self.queue.push(current);
    }

    return { current, delayed };
  }

  private getRespawnLocation(self: Player) {
    if (
      self.checkpoint &&
      this.world.blockAt(self.checkpoint, TileLayer.Action) === this.ids.checkpoint
    ) {
      return self.checkpoint;
    }

    return Vector.SPAWN_LOCATION;
  }

  /**
   * God mode players have a different enough routine to warrant putting their
   * code into another function.
   */
  tickGodPlayer(player: Player) {
    const self = player;

    if (self.isDead) {
      self.revive();
    }

    const horizontalInput = Number(self.input.right) - Number(self.input.left);
    const verticalInput = Number(self.input.down) - Number(self.input.up);
    self.isSpaceJustPressed = self.isSpaceDown = false;

    const movementDirection = new Vector(horizontalInput, verticalInput);
    const playerForce = Vector.mults(movementDirection, self.speedMult);
    const appliedForce = Vector.divs(playerForce, Config.physics.variable_multiplyer);

    let position = self.position;
    let velocity = calculateDragVector(self.velocity, appliedForce, movementDirection, Vector.Zero);

    const worldBounds = Vector.mults(Vector.subs(this.world.size, 1), Config.blockSize);

    position = Vector.add(position, velocity);
    position = Vector.clamp(position, Vector.Zero, worldBounds);
    position = autoAlignVector(position, velocity, appliedForce);

    self.position = position;
    self.velocity = velocity;
  }

  performZoosts(self: Player, position: Vector, direction: Vector) {
    const checkCollision = (position: Vector) =>
      this.blockOutsideBounds(position) || this.willCollide(self, position);

    const interactionPositions = performZoosts(
      checkCollision,
      this.world,
      this.ids,
      self,
      position,
      direction
    );

    let next = interactionPositions.next();

    while (!next.done) {
      self.worldPosition = next.value;
      this.triggerBlockAction(self);
      next = interactionPositions.next();
    }

    self.worldPosition = next.value;
  }

  playerIsColliding(self: Player, position: Vector): boolean {
    const corners = this.cornersOfPlayer(position);

    for (const position of corners) {
      if (this.pointOutsideBounds(position)) {
        return true;
      }
    }

    const surroundingBlocks = corners.map((position) => this.roundPositionToBlockCoords(position));

    const playerHitbox = new Rectangle(position, Vector.newScalar(Config.blockSize));

    for (const blockCoord of surroundingBlocks) {
      if (this.blockOutsideBounds(blockCoord)) continue;

      if (this.collidesWithBlock(playerHitbox, self, blockCoord)) {
        return true;
      }
    }

    return false;
  }

  collidesWithBlock(playerHitbox: Rectangle, player: Player, blockCoord: Vector) {
    if (!this.willCollide(player, blockCoord)) return false;

    // TODO: add more hitboxes for collision (e.g. slabs, stairs)
    const blockPosition = Vector.mults(blockCoord, Config.blockSize);
    const blockHitbox = new Rectangle(blockPosition, Vector.newScalar(Config.blockSize));

    return Rectangle.overlaps(playerHitbox, blockHitbox);
  }

  cornersOfPlayer(position: Vector): Vector[] {
    return [
      position,
      new Vector(position.x + Config.blockSize, position.y),
      new Vector(position.x, position.y + Config.blockSize),
      Vector.adds(position, Config.blockSize),
    ];
  }

  blockOutsideBounds(blockCoord: Vector): boolean {
    return (
      blockCoord.x < 0 ||
      blockCoord.y < 0 ||
      blockCoord.x >= this.world.size.x ||
      blockCoord.y >= this.world.size.y
    );
  }

  pointOutsideBounds(point: Vector): boolean {
    return !Rectangle.pointInside(Rectangle.mults(this.world.bounds, Config.blockSize), point);
  }

  roundPositionToBlockCoords(position: Vector): Vector {
    return Vector.floor(Vector.divs(position, Config.blockSize));
  }

  // TODO: below this point still needs cleaning

  willCollide(self: Player, blockPosition: Vector): boolean {
    if (self.isInGodMode) {
      throw new Error("this is impossible because we only check collisions in not-god-mode");
    }

    const id = this.world.blockAt(blockPosition, TileLayer.Foreground);
    const block = this.ids.tiles.forId(id);

    let willCollide = block.isSolid;

    const storageKey = block.stateStorage;
    if (storageKey) {
      willCollide = this.collisionStates.playerWillCollideWith(storageKey, this.ticks, self);
      if (block.negateCollisionFromState) willCollide = !willCollide;
    }

    return willCollide;
  }

  handleSurroundingBlocks(self: Player) {
    const surroundedBlocks = this.getSurroundingBlocks(self);

    const changes = self.collidedWith.update(surroundedBlocks);
    for (const [change, key] of changes) {
      switch (change) {
        case "added":
          self.stateStorage.setCollisionState(
            key,
            this.collisionStates.willCollideWith(key, self.ticks)
          );
          break;
        case "removed":
          self.stateStorage.setCollisionState(key, undefined);
          break;
      }

      const keyState = this.collisionStates.playerWillCollideWith("redkey", this.ticks, self);
      this.events.emit("playerKeyState", "red", self, keyState);
    }
  }

  getSurroundingBlocks(self: Player) {
    const inside = new Set<StateStorageKey>();

    const surroundingBlocks = this.cornersOfPlayer(self.position).map(
      this.roundPositionToBlockCoords
    );

    for (const surroundingBlock of surroundingBlocks) {
      const id = this.world.blockAt(surroundingBlock, TileLayer.Foreground);
      const block = this.ids.tiles.forId(id);

      const storageKey = block.stateStorage;
      if (storageKey) {
        inside.add(storageKey);
      }
    }

    return inside;
  }

  triggerBlockAction(self: Player) {
    if (Vector.eq(self.worldPosition, self.lastActivateBlockPosition)) return;

    const decorationBlock = this.world.blockAt(self.worldPosition, TileLayer.Decoration);
    this.handleActionSigns(self, decorationBlock, self.worldPosition);

    const actionBlock = this.world.blockAt(self.worldPosition, TileLayer.Action);
    this.handleActionCheckpoints(self, actionBlock, self.worldPosition);
    this.handleActionHazards(self, actionBlock);
    this.handleActionKeys(self, actionBlock);

    self.lastActivateBlockPosition = self.worldPosition;
  }

  private handleActionSigns(self: Player, blockId: number, position: Vector) {
    let currentlyInSign: false | Vector = false;
    if (blockId === this.ids.sign) {
      currentlyInSign = position;
    }

    const { x, y } = position;

    const inSign = (x: false | Vector) => !!x;

    // if we weren't in a sign but we are
    if (!inSign(self.insideSign) && inSign(currentlyInSign)) {
      self.insideSign = currentlyInSign;
      this.events.emit("signOn", x, y);
    }

    // if we aren't in a sign but we were
    else if (!inSign(currentlyInSign) && inSign(self.insideSign)) {
      self.insideSign = false;
      this.events.emit("signOff");
    }

    // if we're in a different sign
    else if (!equal(currentlyInSign, self.insideSign)) {
      self.insideSign = currentlyInSign;
      this.events.emit("signOn", x, y);
    }
  }

  private handleActionCheckpoints(self: Player, blockId: number, blockPosition: Vector) {
    if (this.ids.checkpoint === blockId) {
      const checkpoint = blockPosition;

      if (!self.hasCheckpoint || !Vector.eq(self.checkpoint!, checkpoint)) {
        this.events.emit("checkpoint", self, checkpoint);
        self.checkpoint = checkpoint;
      }
    }
  }

  private handleActionHazards(self: Player, actionBlock: number) {
    if (this.ids.isHazard(actionBlock)) {
      self.kill();
    }
  }

  private handleActionKeys(self: Player, actionBlock: number) {
    if (this.ids.keysRedKey === actionBlock) {
      this.events.emit("keyTouch", "red", self);
    }
  }
}

class CollisionStates {
  collisionStates: { [K in StateStorageKey]?: CollisionValue } = {};

  constructor() {}

  playerWillCollideWith(stateStorageKey: StateStorageKey, ticks: number, player: Player): boolean {
    return (
      player.stateStorage.getCollisionState(stateStorageKey) ??
      this.willCollideWith(stateStorageKey, ticks)
    );
  }

  willCollideWith(stateStorageKey: StateStorageKey, ticks: number): boolean {
    const collisionValue = this.collisionStates[stateStorageKey];
    if (!collisionValue) return false;
    else return collisionValue.hasCollisionOn(ticks);
  }

  setCollisionTo(stateStorageKey: StateStorageKey, value: boolean) {
    this.collisionStates[stateStorageKey] = new ConstantCollisionValue(value);
  }

  setCollisionOffOnTick(stateStorageKey: StateStorageKey, tickOffAt: number) {
    this.collisionStates[stateStorageKey] = new TickCollisionValue(tickOffAt);
  }

  getCollisionStates(ticks: number): Partial<Record<StateStorageKey, boolean>> {
    const states: Partial<Record<StateStorageKey, boolean>> = {};

    for (const rawKey in this.collisionStates) {
      const key = rawKey as StateStorageKey;
      states[key] = this.willCollideWith(key, ticks);
    }

    return states;
  }
}

interface CollisionValue {
  hasCollisionOn(ticks: number): boolean;
}

class ConstantCollisionValue implements CollisionValue {
  constructor(readonly collisionOn: boolean) {}

  hasCollisionOn(): boolean {
    return this.collisionOn;
  }
}
class TickCollisionValue implements CollisionValue {
  constructor(readonly tickCollisionDisabledAt: number) {}

  hasCollisionOn(ticks: number): boolean {
    return ticks < this.tickCollisionDisabledAt;
  }
}

export class DifferentialSet<T> {
  last: Set<T> = new Set();

  constructor() {}

  update(next: Set<T>): ["added" | "removed", T][] {
    const elements: ["added" | "removed", T][] = [];

    const all = new Set<T>([...this.last, ...next]);
    for (const element of all) {
      const lastHas = this.last.has(element);
      const nextHas = next.has(element);

      if (lastHas && !nextHas) {
        elements.push(["removed", element]);
      } else if (!lastHas && nextHas) {
        elements.push(["added", element]);
      }
    }

    this.last = next;
    return elements;
  }
}

class DifferentialRecord<K extends string, V> {
  last: Partial<Record<K, V>> = {};

  constructor() {}

  update(next: Partial<Record<K, V>>): ["added" | "removed" | "updated", K][] {
    const updates: ["added" | "removed" | "updated", K][] = [];

    const keys = [...Object.keys(this.last), ...Object.keys(next)] as K[];
    for (const key of keys) {
      const lastHas = key in this.last;
      const nextHas = key in next;

      if (lastHas && !nextHas) {
        updates.push(["removed", key]);
      } else if (!lastHas && nextHas) {
        updates.push(["added", key]);
      } else if (lastHas && nextHas) {
        if (this.last[key] !== next[key]) {
          updates.push(["updated", key]);
        }
      }
    }

    return updates;
  }
}
