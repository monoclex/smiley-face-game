import { createNanoEvents } from "../../nanoevents";
import { Blocks } from "../../game/Blocks";
import { ZSMovement } from "../../packets";
import TileRegistration from "../../tiles/TileRegistration";
import { TileLayer } from "../../types";
import { PhysicsEvents, PhysicsSystem } from "../PhysicsSystem";
import { Player } from "../Player";
import { Vector } from "../Vector";
import { BlockIdCache } from "./BlockIdCache";
import { Config } from "./Config";
import equal from "fast-deep-equal";
import { Rectangle } from "../Rectangle";

// half a second until alive
const TIME_UNTIL_ALIVE = 250;

// https://github.com/Seb-135/ee-offline/blob/main/src/Player.as
export class EEPhysics implements PhysicsSystem {
  readonly optimalTickRate: number;
  readonly events = createNanoEvents<PhysicsEvents>();

  ticks = 0;
  private tickRedDisabled = 0;
  start = Date.now();

  private ids: BlockIdCache;

  lastRedKeyOn = this.redKeyOn;
  get redKeyOn() {
    return this.ticks < this.tickRedDisabled;
  }

  private readonly ticksUntilAlive: number;

  constructor(tiles: TileRegistration, private readonly world: Blocks, ticksPerSecond: number) {
    this.optimalTickRate = 1000 / ticksPerSecond;
    this.ticksUntilAlive = TIME_UNTIL_ALIVE / this.optimalTickRate;
    this.ids = new BlockIdCache(tiles);
  }

  update(elapsedMs: number, players: Player[]) {
    while ((this.ticks + 1) * this.optimalTickRate <= elapsedMs) {
      this.tick(players);

      if (this.lastRedKeyOn !== this.redKeyOn) {
        this.events.emit("keyState", "red", this.redKeyOn);
        this.lastRedKeyOn = this.redKeyOn;
      }
    }
  }

  triggerKey(kind: "red", deactivateTime: number, player: Player): void {
    this.tickRedDisabled = Math.ceil((deactivateTime - this.start) / this.optimalTickRate);
  }

  updatePlayer(movement: ZSMovement, player: Player): void {
    player.sfgPosition = movement.position;
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

    // if we're on a zoost, push the direction it's in to the queue
    if (this.isZoost(current)) {
      this.performZoosts(self, self.worldPosition, this.zoostDirToVec(current));
      return;
    }

    if (this.isSpikes(current)) {
      self.kill();
      return;
    }

    let position = self.position;
    let velocity = self.velocity;

    const currentGravityDirection = this.getGraviationalPull(current);
    const delayedGravityDirection = this.getGraviationalPull(delayed);

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

    // applied force is the force that will be applied to the player
    const appliedForce = Vector.divs(
      Vector.add(playerForce, delayedGravityForce),
      Config.physics.variable_multiplyer
    );

    velocity = Vector.map(
      this.performSpeedDrag.bind(this),
      velocity,
      appliedForce,
      movementDirection,
      Vector.swap(currentGravityDirection)
    );

    // the previous section was for the physics direction we're trying to go in
    // here, we apply this regardless of what the previous section has done because
    // boost's gravity overtakes regular gravity
    const requiredForce = this.getRequiredForce(current);
    velocity = Vector.substituteZeros(requiredForce, velocity);

    let {
      grounded,
      position: stepPosition,
      velocity: stepVelocity,
    } = this.performStepping(self, position, velocity, current, currentGravityDirection);

    position = stepPosition;
    velocity = stepVelocity;

    velocity = this.performJumping(
      self,
      grounded,
      currentGravityForce,
      currentGravityDirection,
      delayedGravityDirection,
      velocity
    );

    position = this.performAutoalign(position, velocity, appliedForce);

    self.position = position;
    self.velocity = velocity;
    this.triggerBlockAction(self, self.center);
  }

  private isSpikes(current: number) {
    return (
      current == this.ids.spikeUp ||
      current == this.ids.spikeRight ||
      current == this.ids.spikeDown ||
      current == this.ids.spikeLeft
    );
  }

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
    let velocity = Vector.map(
      this.performSpeedDrag.bind(this),
      self.velocity,
      appliedForce,
      movementDirection,
      Vector.Zero
    );

    const worldBounds = Vector.mults(Vector.subs(this.world.size, 1), Config.blockSize);

    position = Vector.add(position, velocity);
    position = Vector.clamp(position, Vector.Zero, worldBounds);
    position = this.performAutoalign(position, velocity, appliedForce);

    self.position = position;
    self.velocity = velocity;
  }

  private performSpeedDrag(
    velocity: number,
    appliedForce: number,
    axisMovement: number,
    crossAxisGravity: number
  ) {
    // NOTES: we could actually run through this code no matter what, couldn't we?
    // basically if speedx/modifierx is 0, all the multiplication will have no effect
    //
    // if our horizontal speed is changing
    if (!(velocity || appliedForce)) {
      return velocity;
    }

    velocity += appliedForce;

    // =-=-=
    // apply different physics drags in different liquids/blocks/etc
    // =-=-=

    // this applies a lot of drag - helps us slow down fast
    velocity *= Config.physics.base_drag;
    if (
      // if we have vertical gravitational pull AND we're not moving
      // when would we want both conditions?
      // (self.modY) ||: the drag would ALWAYS be applied (when in air blocks)
      //                 making it really hard to move left/right
      // (!movementX) ||: when there's no vertitcal pull (like on dots),
      //                  the player has just as much grip as when they're on land
      //                  this makes dots not slippery
      (!axisMovement && crossAxisGravity) ||
      // OR we're going left and want to go right
      // why do we want this? to be able to make hard left->right turns
      (velocity < 0 && axisMovement > 0) ||
      // OR we're going right and want to go left
      // why do we want this? to be able to make hard right->left turns
      (velocity > 0 && axisMovement < 0)
    ) {
      velocity *= Config.physics.no_modifier_drag;
    }

    // clamping speed
    // 16 is the maximum speed allowed before we start phasing through blocks
    if (velocity > 16) {
      velocity = 16;
    } else if (velocity < -16) {
      velocity = -16;
    } else if (Math.abs(velocity) < 0.0001) {
      velocity = 0;
    }

    return velocity;
  }

  private performJumping(
    self: Player,
    grounded: boolean,
    currentGravityForce: Vector,
    currentGravity: Vector,
    delayedGravity: Vector,
    velocity: Vector
  ) {
    let tryToPerformJump = false;

    // if space has just been pressed, we want to jump immediately
    if (self.isSpaceJustPressed) {
      tryToPerformJump = true;
      self.waitedForInitialLongJump = "idle";
    }
    // otherwise, if space has been (or is just) held
    else if (self.isSpaceDown) {
      // if lastJump is negative, meaning
      // it is only negative if `isSpaceJustPressed` has been the "most recently"
      // pressed thing
      if (self.waitedForInitialLongJump === "waiting") {
        // if 750ms has elapsed since the last jump
        if (self.ticks - self.lastJump > 75) {
          // we want to perform a jump
          tryToPerformJump = true;
        }
      }
      // if `isSpaceJustPressed` is NOT the most recent thing,
      // i.e., we have been holding space for a while
      else {
        // if it's been 150ms
        if (self.ticks - self.lastJump > 15) {
          // we want to perform a jump automatically
          // this prevents the player from hitting jump too fast
          tryToPerformJump = true;
        }
      }
    }

    const horziontalGravityApplied = currentGravity.x && delayedGravity.y;
    const verticalGravityApplied = currentGravity.y && delayedGravity.y;

    if (
      // if either:
      // - we are not moving horizontally but we have horizontal force applied on us
      // - we are not moving vertically but we have vertical force applied on us
      ((velocity.x == 0 && horziontalGravityApplied) ||
        (velocity.y == 0 && verticalGravityApplied)) &&
      // and we're grounded
      grounded
    ) {
      // On ground so reset jumps to 0
      self.jumpCount = 0;
    }

    // we needs this here because - what if we never jumped and we're falling?
    // we don't want to let the player jump in mid-air just from falling
    if (self.jumpCount == 0 && !grounded) {
      self.jumpCount = 1; // Not on ground so first 'jump' removed
    }

    if (tryToPerformJump) {
      // if we can jump, AND we're being pulled in the X direction
      //
      // the `origModX` tells us the force of the CURRENT block we're in,
      // and the `modX` tells us the force of the PREVIOUS TICK'S block that we were in.
      //
      // it's very unlikely that that the origModX will differ from modX, so i don't think
      // we need to check both. plus we should only be checking delayed (modX) as physics
      // work based on the previous tick's block (or second prev block, depending on what's in the queue)
      const beingPulledByGravity = horziontalGravityApplied || verticalGravityApplied;

      if (self.jumpCount < self.maxJumps && beingPulledByGravity) {
        self.lastJump = self.ticks;
        self.jumpCount += 1;

        if (self.waitedForInitialLongJump === "idle") {
          self.waitedForInitialLongJump = "waiting";
        } else if (self.waitedForInitialLongJump === "waiting") {
          self.waitedForInitialLongJump = "jumped";
        }

        const jumpForce =
          (Config.physics.jump_height * self.jumpMult) / Config.physics.variable_multiplyer;

        // a vector `jumpForce` units against gravity
        const jumpVector = Vector.mults(Vector.negate(currentGravityForce), jumpForce);

        // update velocity to have jump force applied to it
        return Vector.substituteZeros(jumpVector, velocity);
      }
    }

    return velocity;
  }

  private performStepping(
    self: Player,
    position: Vector,
    velocity: Vector,
    current: number,
    currentGravityDirection: Vector
  ) {
    let keep = Vector.Ones;

    const speedX = velocity.x,
      x = position.x,
      factoryHorzState = () => ({ pos: x, remainder: x % 1, currentSpeed: speedX });

    const speedY = velocity.y,
      y = position.y,
      factoryVertState = () => ({ pos: y, remainder: y % 1, currentSpeed: speedY });

    let horzGenState = factoryHorzState();
    let vertGenState = factoryVertState();
    const getPositionFromState = () => ({ x: horzGenState.pos, y: vertGenState.pos });

    let grounded = false;

    let horzStepper = this.stepAlgo(current, horzGenState);
    let horzSteps = 0;

    let vertStepper = this.stepAlgo(current, vertGenState);
    let vertSteps = 0;

    const checkCollision = (
      velocity: number,
      currentGravityDirection: number,
      reset: () => void
    ) => {
      // if we are in collision with any blocks after stepping a singular pixel
      if (this.playerIsColliding(self, getPositionFromState())) {
        // if we are being pulled to the right,
        // but yet we still have speed to go right that was not yet applied
        // and we are also in collision with a block,
        // we must be grounded!
        if (velocity > 0 && currentGravityDirection > 0) grounded = true;
        // same for the other direction
        if (velocity < 0 && currentGravityDirection < 0) grounded = true;

        reset();
      }
    };

    let doneX = false,
      doneY = false;

    // if we have x speed and we haven't collided yet (or same for y)
    while ((horzGenState.currentSpeed && !doneX) || (vertGenState.currentSpeed && !doneY)) {
      doneX = Boolean(horzStepper.next().done) || doneX;
      horzSteps++;
      checkCollision(velocity.x, currentGravityDirection.x, () => {
        // we ran into collision so we shouldn't move anymore
        keep = Vector.mutateX(keep, 0);

        // reset our generator to right before it performed this tick
        horzGenState = factoryHorzState();
        horzStepper = this.stepAlgo(current, horzGenState);

        horzSteps--;
        for (let i = 0; i < horzSteps; i++) {
          horzStepper.next();
        }

        doneX = true;
      });

      doneY = Boolean(vertStepper.next().done) || doneY;
      vertSteps++;
      checkCollision(velocity.y, currentGravityDirection.y, () => {
        // we ran into collision so we shouldn't move anymore
        keep = Vector.mutateY(keep, 0);

        // reset our generator to right before it performed this tick
        vertGenState = factoryVertState();
        vertStepper = this.stepAlgo(current, vertGenState);

        vertSteps--;
        for (let i = 0; i < vertSteps; i++) {
          vertStepper.next();
        }

        doneY = true;
      });
    }

    return {
      position: getPositionFromState(),
      velocity: Vector.mult(keep, velocity),
      grounded,
    };
  }

  *stepAlgo(current: number, me: { pos: number; remainder: number; currentSpeed: number }) {
    // if we're going right
    if (me.currentSpeed > 0) {
      if (me.currentSpeed + me.remainder >= 1) {
        me.pos += 1 - me.remainder;
        me.pos >>= 0;
        me.currentSpeed -= 1 - me.remainder;
        yield;
      }

      while (me.currentSpeed >= 1) {
        me.pos += 1;
        me.pos >>= 0;
        me.currentSpeed -= 1;
        yield;
      }

      // we don't have enough speed to move a full pixel, apply rest of speed
      me.pos += me.currentSpeed;
      me.currentSpeed = 0;
      yield;
    }
    // if we're going left
    else if (me.currentSpeed < 0) {
      // note about this section: ee weirdness: if you're perfectly pixel aligned,
      // you consume all of your speed at once (lol)

      // hey! want to enable 4 block jump?
      // remove this conditional!:
      //  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
      if (me.remainder + me.currentSpeed < 0 && (me.remainder !== 0 || this.isBoost(current))) {
        // clip ourselves to the nearest pixel
        // me.pos = Math.trunc(me.pos);
        // use up some speed for moving
        // me.currentSpeed += me.remainder;
        me.pos -= me.remainder;
        me.pos >>= 0;
        me.currentSpeed += me.remainder;
        yield;

        while (me.currentSpeed < -1) {
          // while we can move a full pixel, move a full pixel
          me.currentSpeed += 1;
          me.pos -= 1;
          yield;
        }

        // consume the rest of our speed
        me.pos += me.currentSpeed;
        me.currentSpeed = 0;
        yield;
      } else {
        // consume all of our speed all at once! (wow!)
        me.pos += me.currentSpeed;
        me.currentSpeed = 0;
        yield;
      }
    }
  }

  performAutoalign(position: Vector, velocity: Vector, appliedForce: Vector): Vector {
    return Vector.map(this.tryAutoAlign.bind(this), position, velocity, appliedForce);
  }

  tryAutoAlign(position: number, velocity: number, appliedForce: number): number {
    const isSlow = (n: number) => Math.abs(n) < 1 / 256;
    const lowPull = (n: number) => Math.abs(n) < 0.1;

    // don't perform auto align if not slow enough
    if (!isSlow(velocity) || !lowPull(appliedForce)) {
      return position;
    }

    const blockOffset = position % Config.blockSize;

    // sadly we can't really de-duplicate this very well
    // left and right autoaligning have distinctly different behaviors, so we
    // have to keep both branches.
    //
    // as for the snap range thing,

    const blockCoords = position / Config.blockSize;

    const distance = (a: number, b: number) => Math.abs(a - b);

    const leftBlock = Math.floor(blockCoords) * Config.blockSize;
    if (distance(leftBlock, position) < Config.physics.autoalign_snap_range) {
      return leftBlock;
    }

    const rightBlock = Math.ceil(blockCoords) * Config.blockSize;
    if (distance(rightBlock, position) < Config.physics.autoalign_snap_range) {
      return rightBlock;
    }

    if (blockOffset < Config.physics.autoalign_range) {
      const nudge = -blockOffset / (Config.blockSize - 1);
      return position + nudge;
    }

    const oppositeBlockOffset = 16 - blockOffset;
    if (oppositeBlockOffset < Config.physics.autoalign_range) {
      const nudge = (Config.physics.autoalign_range - oppositeBlockOffset) / (Config.blockSize - 1);
      return position + nudge;
    }

    // did not auto align
    return position;
  }

  performZoosts(self: Player, position: Vector, direction: Vector) {
    let turns = 0;
    while (turns < 1) {
      const originalPosition = position;
      position = Vector.add(position, direction);

      // if we're colliding with a solid block, we need to not to that
      if (this.blockOutsideBounds(position) || this.willCollide(self, position)) {
        // go back
        position = originalPosition;

        // do we have any other directions we could go?
        const actionBlockOn = this.world.blockAt(position, TileLayer.Action);
        if (this.isZoost(actionBlockOn)) {
          direction = this.zoostDirToVec(actionBlockOn);
          turns++;
          continue;
        }

        break;
      }

      // perform actions (trigger keys/etc)
      this.triggerBlockAction(self, Vector.mults(position, Config.blockSize));

      if (self.isDead) {
        break;
      }
    }

    self.position = Vector.mults(position, Config.blockSize);
  }

  playerIsColliding(self: Player, position: Vector): boolean {
    const corners = [
      position,
      new Vector(position.x + Config.blockSize, position.y),
      new Vector(position.x, position.y + Config.blockSize),
      Vector.adds(position, Config.blockSize),
    ];

    for (const position of corners) {
      if (this.pointOutsideBounds(position)) {
        return true;
      }
    }

    const surroundingBlocks = corners.map((position) => this.roundPositionToBlockCoords(position));

    const playerHitbox = new Rectangle(position, Vector.newScalar(Config.blockSize));

    for (const blockCoord of surroundingBlocks) {
      if (this.blockOutsideBounds(blockCoord)) continue;
      if (!this.willCollide(self, blockCoord)) continue;

      // TODO: add more hitboxes for collision (e.g. slabs, stairs)
      const blockPosition = Vector.mults(blockCoord, Config.blockSize);
      const blockHitbox = new Rectangle(blockPosition, Vector.newScalar(Config.blockSize));

      if (Rectangle.overlaps(playerHitbox, blockHitbox)) {
        return true;
      }
    }

    return false;
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
    return (
      point.x < 0 ||
      point.y < 0 ||
      point.x > this.world.size.x * Config.blockSize ||
      point.y > this.world.size.y * Config.blockSize
    );
  }

  roundPositionToBlockCoords(position: Vector): Vector {
    return Vector.floor(Vector.divs(position, Config.blockSize));
  }

  willCollide(self: Player, blockPosition: Vector): boolean {
    if (self.isInGodMode) {
      throw new Error("this is impossible because we only check collisions in not-god-mode");
    }

    const fgId = this.world.blockAt(blockPosition, TileLayer.Foreground);
    const actionId = this.world.blockAt(blockPosition, TileLayer.Action);

    const [isInsideKeyBlock, redKeyTouchedState] = self.insideKeyBlock;

    let redKeyTouched = this.redKeyOn;
    if (isInsideKeyBlock) {
      redKeyTouched = redKeyTouchedState;
    }

    // TODO: there's got to be a better way to switch the solid-ness of a gate/door
    const keyNotSolid = redKeyTouched ? this.ids.keysRedDoor : this.ids.keysRedGate;

    const isPassthru = (id: number) =>
      id === 0 || id === keyNotSolid || this.ids.tiles.forId(id).isSolid === false;

    return !isPassthru(fgId) || !isPassthru(actionId);
  }

  triggerBlockAction(self: Player, position: Vector) {
    const blockPosition = this.roundPositionToBlockCoords(position);

    const maxX = this.world.size.x;
    const maxY = this.world.size.y;
    const inBounds = (x: number, y: number) => x >= 0 && x < maxX && y >= 0 && y < maxY;

    // if (!inBounds(x, y)) {
    //   throw new Error("we should never be out of bounds");
    // }

    const deco = this.world.blockAt(blockPosition, TileLayer.Decoration);

    this.handleActionSigns(deco, position, self, blockPosition);

    const actionBlock = this.world.blockAt(blockPosition, TileLayer.Action);

    this.handleActionCheckpoints(actionBlock, blockPosition, self);
    this.handleActionSpikes(actionBlock, self);
    this.handleActionKeys(actionBlock, self, inBounds, position);
  }

  private handleActionSigns(
    deco: number,
    position: Vector<number>,
    self: Player,
    { x, y }: Vector
  ) {
    let currentlyInSign: false | Vector = false;
    if (deco === this.ids.sign) {
      currentlyInSign = position;
    }

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

  private handleActionCheckpoints(actionBlock: number, { x, y }: Vector, self: Player) {
    if (this.ids.checkpoint === actionBlock) {
      const checkpoint = new Vector(x, y);

      if (!self.hasCheckpoint || !Vector.eq(self.checkpoint!, checkpoint)) {
        this.events.emit("checkpoint", self, checkpoint);
      }

      self.checkpoint = checkpoint;
    }
  }

  private handleActionSpikes(actionBlock: number, self: Player) {
    if (
      this.ids.spikeUp === actionBlock ||
      this.ids.spikeRight === actionBlock ||
      this.ids.spikeDown === actionBlock ||
      this.ids.spikeLeft === actionBlock
    ) {
      self.kill();
    }
  }

  private handleActionKeys(
    actionBlock: number,
    self: Player,
    inBounds: (x: number, y: number) => boolean,
    position: Vector<number>
  ) {
    if (this.ids.keysRedKey === actionBlock) {
      if (!self.insideRedKey) {
        this.events.emit("keyTouch", "red", self);
      }

      self.insideRedKey = true;
    } else {
      self.insideRedKey = false;
    }

    const checkInsideKey = (x: number, y: number) => {
      x = Math.floor(x / Config.blockSize);
      y = Math.floor(y / Config.blockSize);
      if (!inBounds(x, y)) return false;

      const foregroundBlock = this.world.blockAt({ x, y }, TileLayer.Foreground);
      if (this.ids.keysRedDoor === foregroundBlock || this.ids.keysRedGate === foregroundBlock) {
        const [prevInsideKeyBlock, _] = self.insideKeyBlock;

        if (!prevInsideKeyBlock) {
          self.insideKeyBlock = [true, this.redKeyOn];
        }
        return true;
      } else {
        return false;
      }
    };

    const prev = self.insideKeyBlock;

    // lol this is such a hack
    const didUpdateInsideKey =
      checkInsideKey(position.x, position.y) ||
      checkInsideKey(position.x - 16, position.y - 16) ||
      checkInsideKey(position.x + 15.9, position.y - 16) ||
      checkInsideKey(position.x - 16, position.y + 15.9) ||
      checkInsideKey(position.x + 15.9, position.y + 15.9);

    if (!didUpdateInsideKey) {
      self.insideKeyBlock = [false, false];
    }

    const current = self.insideKeyBlock;

    if (prev[0] !== current[0]) {
      this.events.emit("moveOutOfKeys", self);
    }
  }

  /**
   * The gravitational pull of a block will not only apply a force to the player,
   * it will also determine the axis that the player is allowed to jump against.
   */
  getGraviationalPull(blockId: number) {
    // boosts (and dots) are considered to have no gravitational pull
    // as we do not want to allow the player to jump in any axis.
    switch (blockId) {
      case this.ids.boostUp:
      case this.ids.boostRight:
      case this.ids.boostLeft:
      case this.ids.boostDown:
        return Vector.Zero;

      case this.ids.arrowUp:
        return Vector.Up;
      case this.ids.arrowRight:
        return Vector.Right;
      case this.ids.arrowLeft:
        return Vector.Left;
      case this.ids.arrowDown:
        return Vector.Down;

      case this.ids.dot:
        return Vector.Zero;

      // TODO(feature-gravity-effect): change default direction depending upon
      //   gravity effect direction
      default:
        return Vector.Down;
    }
  }

  zoostDirToVec(zoostId: number) {
    switch (zoostId) {
      case this.ids.zoostUp:
        return Vector.Up;
      case this.ids.zoostRight:
        return Vector.Right;
      case this.ids.zoostDown:
        return Vector.Down;
      case this.ids.zoostLeft:
        return Vector.Left;
      default:
        throw new Error("called `zoostDirToVec` without zoost");
    }
  }

  isZoost(id: number) {
    return (
      id == this.ids.zoostUp ||
      id == this.ids.zoostRight ||
      id == this.ids.zoostDown ||
      id == this.ids.zoostLeft
    );
  }

  isBoost(id: number) {
    return (
      id == this.ids.boostUp ||
      id == this.ids.boostRight ||
      id == this.ids.boostLeft ||
      id == this.ids.boostDown
    );
  }

  // so basically boosts while they don't have "gravity" (so they technically
  // aren't pulling you in a direction) have an amount of force they apply instead
  // to the player.
  getRequiredForce(block: number) {
    const MAX_SPEED = 16;

    switch (block) {
      case this.ids.boostUp:
        return Vector.mults(Vector.Up, MAX_SPEED);
      case this.ids.boostRight:
        return Vector.mults(Vector.Right, MAX_SPEED);
      case this.ids.boostDown:
        return Vector.mults(Vector.Down, MAX_SPEED);
      case this.ids.boostLeft:
        return Vector.mults(Vector.Left, MAX_SPEED);
      default:
        return Vector.Zero;
    }
  }
}
