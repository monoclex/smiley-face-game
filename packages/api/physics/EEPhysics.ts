import { createNanoEvents } from "../nanoevents";
import { Blocks } from "../game/Blocks";
import { ZSMovement } from "../packets";
import TileRegistration from "../tiles/TileRegistration";
import { TileLayer, ZHeap, ZKeyKind, ZSwitchId } from "../types";
import { Player } from "./Player";
import { Vector } from "./Vector";
import { BlockIdCache } from "./BlockIdCache";
import { Config } from "./Config";
import equal from "fast-deep-equal";
import { Rectangle } from "./Rectangle";
import { autoAlignVector } from "./algorithms/autoAlign";
import { calculateDragVector } from "./algorithms/calculateDrag";
import { collisionStepping } from "./algorithms/collisionStepping";
import { performJumping } from "./algorithms/jumping";
import { performZoosts } from "./algorithms/zoosts";
import { Keys } from "./Keys";
import { solidHitbox } from "../tiles/hitboxes";
import { ComplexBlockBehavior, HeapKind } from "../tiles/register";
import { PhysicsEvents } from "./PhysicsEvents";

// half a second until alive
const TIME_UNTIL_ALIVE = 250;
const TIME_UNTIL_FIRST_JUMP = 750;
const TIME_UNTIL_NTH_JUMP = 150;

// for the reference EE physics implementation, see here:
// https://github.com/Seb-135/ee-offline/blob/main/src/Player.as
// the physics code in SFG has been completely rewritten from scratch but keeps
// all of the bugs and quirks the original EE physics code has
export class EEPhysics {
  readonly msPerTick: number;
  readonly events = createNanoEvents<PhysicsEvents>();
  readonly ids: BlockIdCache;
  readonly keys: Keys = new Keys(this);

  ticks = 0;
  start = Date.now();

  private readonly ticksUntilAlive: number;
  private readonly ticksUntilFirstJump: number;
  private readonly ticksUntilNthJump: number;

  constructor(tiles: TileRegistration, private readonly world: Blocks, ticksPerSecond: number) {
    this.msPerTick = 1000 / ticksPerSecond;
    this.ids = new BlockIdCache(tiles);
    this.ticksUntilAlive = TIME_UNTIL_ALIVE / this.msPerTick;
    this.ticksUntilFirstJump = TIME_UNTIL_FIRST_JUMP / this.msPerTick;
    this.ticksUntilNthJump = TIME_UNTIL_NTH_JUMP / this.msPerTick;
  }

  updatePlayer(movement: ZSMovement, player: Player): void {
    player.position = movement.position;
    player.velocity = movement.velocity;
    player.input = movement.inputs;

    if (movement.queue.length !== 2) throw new Error("invalid movement packet");
    //@ts-expect-error doesn't coerce nicely
    player.queue = movement.queue;
  }

  // --- physics below ---

  // TODO: we should deprecate this method, and only allow usage of `PhysicsTicker`
  // but im too lazy rn
  update(elapsedMs: number, players: Player[]) {
    while ((this.ticks + 1) * this.msPerTick <= elapsedMs) {
      this.tick(players);
    }
  }

  tick(players: Player[]) {
    this.events.emit("beforeTick", this, players);

    for (const player of players) {
      this.tickPlayer(player);
      player.ticks++;
    }

    for (const key of this.keys.anyJustTurnedOff()) {
      this.events.emit("keyState", key, false);
    }

    this.ticks += 1;
    this.events.emit("onTick", this, players);
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

    if (this.ids.isHazard(current)) {
      self.kill();
      this.events.emit("death", self);
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

    const gravity = Config.physics.gravity * self.gravityMult;
    const delayedGravityForce = Vector.mults(delayedGravityDirection, gravity);
    const currentGravityForce = Vector.mults(currentGravityDirection, gravity);

    const playerForce = Vector.mults(movementDirection, self.speedMult);
    const forceAppliedToPlayer = Vector.divs(
      Vector.add(delayedGravityForce, playerForce),
      Config.physics.variable_multiplyer
    );

    velocity = calculateDragVector(
      velocity,
      forceAppliedToPlayer,
      movementDirection,
      delayedGravityDirection
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
      velocity,
      this.ticksUntilFirstJump,
      this.ticksUntilNthJump
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

    let didClamp;
    [position, didClamp] = Vector.clampDid(position, Vector.Zero, worldBounds);

    if (Vector.either(didClamp)) {
      velocity = Vector.filterOut(didClamp, velocity);
    }

    position = autoAlignVector(position, velocity, appliedForce);

    self.position = position;
    self.velocity = velocity;
  }

  performZoosts(self: Player, position: Vector, direction: Vector) {
    const checkCollision = (position: Vector) => this.playerIsColliding(self, position);

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
      self.position = next.value;
      this.triggerBlockAction(self, false);
      this.handleSurroundingBlocks(self);
      next = interactionPositions.next();
    }

    self.position = next.value;
  }

  playerIsColliding(self: Player, position: Vector): boolean {
    const corners = this.cornersOfPlayer(position);

    for (const position of corners) {
      if (this.pointOutsideBounds(position)) {
        return true;
      }
    }

    const surroundingBlocks = corners.map((position) => this.roundPositionToBlockCoords(position));

    for (const blockCoord of surroundingBlocks) {
      if (this.blockOutsideBounds(blockCoord)) continue;

      // normalize player's hitbox to (0, 0) coords
      const playerHitbox = this.normalizePlayerHitbox(blockCoord, position);

      if (this.collidesWithBlock(playerHitbox, self, blockCoord)) {
        return true;
      }
    }

    return false;
  }

  private normalizePlayerHitbox(blockCoord: Vector<number>, playerPosition: Vector<number>) {
    const blockWorldCoord = Vector.mults(blockCoord, Config.blockSize);
    const playerHitbox = new Rectangle(
      Vector.sub(playerPosition, blockWorldCoord),
      Vector.newScalar(Config.blockSize)
    );
    return playerHitbox;
  }

  collidesWithBlock(playerHitbox: Rectangle, player: Player, blockCoord: Vector) {
    return this.willCollide(player, playerHitbox, blockCoord);
  }

  cornersOfPlayer(position: Vector): Vector[] {
    // TODO: we consider the player a very small bit away from the actual
    // edges, as when we round down we don't want the player to be considered
    // to be touching the bottom/right blocks below them.
    //
    // this works fine, but a less hacky solution would be to check if the hitbox
    // of the player is near the edges of the blocks
    const SMALL_DELTA = 0.0001;

    const OFFSET = Config.blockSize - SMALL_DELTA;

    return [
      position,
      new Vector(position.x + OFFSET, position.y),
      new Vector(position.x, position.y + OFFSET),
      Vector.adds(position, OFFSET),
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

  willCollide(self: Player, playerHitbox: Rectangle, blockPosition: Vector): boolean {
    const id = this.world.blockAt(blockPosition, TileLayer.Foreground);
    const block = this.ids.tiles.forId(id);

    const complexInfo = this.getComplexInfo(TileLayer.Foreground, blockPosition);
    if (complexInfo) {
      const [complex, id, heap] = complexInfo;
      return complex.collides(this, self, id, heap, playerHitbox);
    }

    if (block.hitbox) {
      return Rectangle.overlaps(playerHitbox, block.hitbox);
    }

    return false;
  }

  handleSurroundingBlocks(self: Player) {
    const oldNear = self.lastNear;
    const nowNear = Vector.unique(
      this.cornersOfPlayer(self.position).map(this.roundPositionToBlockCoords)
    );

    const appendPos = (layer: TileLayer, position: Vector) => {
      const complexInfo = this.getComplexInfo(layer, position);
      if (!complexInfo) return null;
      return [position, ...complexInfo] as const;
    };

    const nearAndBehaviors = nowNear
      .flatMap((position) => [
        appendPos(TileLayer.Foreground, position),
        appendPos(TileLayer.Action, position),
      ])
      .filter(Boolean) as [Vector, ComplexBlockBehavior, number, ZHeap][];

    for (const [_, complex, id, heap] of nearAndBehaviors) {
      complex.near(this, self, id, heap);
    }

    for (const [_, complex, id, heap] of oldNear) {
      complex.far(this, self, id, heap);
    }

    self.lastNear = nearAndBehaviors;
  }

  triggerBlockAction(self: Player, activateZoost = true) {
    const actionBlock = this.world.blockAt(self.worldPosition, TileLayer.Action);

    if (activateZoost && this.ids.isZoost(actionBlock)) {
      this.performZoosts(self, self.position, this.ids.zoostDirToVec(actionBlock));
      return;
    }

    if (Vector.eq(self.worldPosition, self.lastBlockIn)) return;

    const decorationBlock = this.world.blockAt(self.worldPosition, TileLayer.Decoration);

    this.handleActionSigns(self, decorationBlock, self.worldPosition);
    this.handleActionCheckpoints(self, actionBlock, self.worldPosition);
    this.handleActionHazards(self, actionBlock);

    // handle more complex blocks
    const performIn = (complex: ComplexBlockBehavior, id: number, heap: ZHeap | 0) =>
      complex.in(this, self, id, heap);

    const performOut = (complex: ComplexBlockBehavior, id: number, heap: ZHeap | 0) =>
      complex.out(this, self, id, heap);

    this.triggerComplex(TileLayer.Foreground, self.worldPosition, performIn);
    this.triggerComplex(TileLayer.Action, self.worldPosition, performIn);
    this.triggerComplex(TileLayer.Foreground, self.lastBlockIn, performOut);
    this.triggerComplex(TileLayer.Action, self.lastBlockIn, performOut);

    self.lastBlockIn = self.worldPosition;
  }

  private triggerComplex(
    layer: TileLayer,
    position: Vector,
    trigger: (complex: ComplexBlockBehavior, id: number, heap: ZHeap | 0) => void
  ) {
    const complexInfo = this.getComplexInfo(layer, position);

    if (complexInfo) {
      trigger(...complexInfo);
    }
  }

  private getComplexInfo(
    layer: TileLayer,
    position: Vector
  ): null | [ComplexBlockBehavior, number, ZHeap | 0] {
    const blockId = this.world.blockAt(position, layer);
    const complex = this.ids.tiles.forId(blockId).complex;
    if (complex) {
      const heap = this.world.heap.getv(layer, position);
      return [complex, blockId, heap];
    }

    return null;
  }

  private handleActionSigns(self: Player, blockId: number, position: Vector) {
    let currentlyInSign: false | Vector = false;
    const blockInfo = this.ids.tiles.forId(blockId);
    if (blockInfo.heap === HeapKind.Sign) {
      currentlyInSign = position;
    }

    const { x, y } = position;

    const inSign = (x: false | Vector) => !!x;

    // if we weren't in a sign but we are
    if (!inSign(self.insideSign) && inSign(currentlyInSign)) {
      self.insideSign = currentlyInSign;
      this.events.emit("signOn", self, x, y);
    }

    // if we aren't in a sign but we were
    else if (!inSign(currentlyInSign) && inSign(self.insideSign)) {
      self.insideSign = false;
      this.events.emit("signOff", self);
    }

    // if we're in a different sign
    else if (!equal(currentlyInSign, self.insideSign)) {
      self.insideSign = currentlyInSign;
      this.events.emit("signOn", self, x, y);
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
      this.events.emit("death", self);
    }
  }

  keyIsOnForPlayer(player: Player, kind: ZKeyKind) {
    const playerCollision = player.keys.getCollision(kind);
    if (typeof playerCollision !== "undefined") return playerCollision;

    const worldCollision = this.keys.isOn(kind);
    return worldCollision;
  }

  getAllKeysOn(player: Player): ZKeyKind[] {
    const keysWithState = Object.keys(player.keys.state) as ZKeyKind[];
    const playerKeysOn = keysWithState.filter((key) => player.keys.getCollision(key) === true);
    const playerKeysOff = keysWithState.filter((key) => player.keys.getCollision(key) === false);

    const worldKeysOn = this.keys.allKeysThatAreOn();

    const unsetKeysInPlayerThatAreOn = worldKeysOn.filter(
      (key) => !playerKeysOn.includes(key) && !playerKeysOff.includes(key)
    );

    return [...playerKeysOn, ...unsetKeysInPlayerThatAreOn];
  }
}
