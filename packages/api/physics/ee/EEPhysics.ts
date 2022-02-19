import { createNanoEvents } from "../../nanoevents";
import { Blocks } from "../../game/Blocks";
import { ZSMovement } from "../../packets";
import TileRegistration from "../../tiles/TileRegistration";
import { TileLayer } from "../../types";
import clamp from "../clamp";
import { PhysicsEvents, PhysicsSystem } from "../PhysicsSystem";
import { Player } from "../Player";
import { Vector } from "../Vector";
import { BlockIdCache } from "./BlockIdCache";
import { Config } from "./Config";
import {
  DotDirection,
  ArrowDirection,
  BoostDirection,
  ZoostDirection,
  isBoost,
  SpikeDirection,
} from "./Directions";
import equal from "fast-deep-equal";

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

    this.ticks += 1;
  }

  tickPlayer(player: Player) {
    const self = player;

    // # if they're dead, don't perform ticks
    if (self.isDead) {
      if (self.shouldBeRevived(this.ticksUntilAlive)) {
        let respawn = Vector.SPAWN_LOCATION;

        if (self.checkpoint) {
          const { x, y } = self.checkpoint;

          if (this.world.blockAt(x, y, TileLayer.Action) === this.ids.checkpoint) {
            respawn = self.checkpoint;
          }
        }

        self.revive(respawn);
      } else {
        return;
      }
    }

    const worldPosition = self.worldPosition;
    const blockX = worldPosition.x;
    const blockY = worldPosition.y;

    // the queue `self.queue` gives the game a bouncier feel
    // if we didn't have this here, holding "up" on dots or standing on up arrows
    // would not have you swing between two blocks - you would be right on the edge
    // of the dot and the air, or the arrow and the air.
    const current = this.world.blockAt(blockX, blockY, TileLayer.Action);

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

    // if we're on a zoost, push the direction it's in to the queue
    if (this.isZoost(current)) {
      self.pushZoostQueue(this.zoostDirToVec(current));
    }

    // don't process zoosts if we're in god mode
    const isFlying = self.isInGodMode;
    if (isFlying) {
      self.clearZoostQueue();
    }

    let currentGravityDirection = Vector.Zero,
      delayedGravityDirection = Vector.Zero;

    if (!isFlying) {
      let direction = self.zoostQueue.shift();
      if (direction != null) {
        this.performZoosts(self, blockX, blockY, direction);
        return;
      }

      currentGravityDirection = this.getGraviationalPull(current);

      if (
        current == this.ids.spikeUp ||
        current == this.ids.spikeRight ||
        current == this.ids.spikeDown ||
        current == this.ids.spikeLeft
      ) {
        self.kill();
      }

      delayedGravityDirection = this.getGraviationalPull(delayed);
    }

    const horizontalInput = Number(self.input.right) - Number(self.input.left);
    const verticalInput = Number(self.input.down) - Number(self.input.up);
    self.isSpaceJustPressed = !self.isSpaceDown && self.input.jump;
    self.isSpaceDown = self.input.jump;

    let movementDirection = new Vector(horizontalInput, verticalInput);

    // prevent the player from moving in the direction of gravity
    movementDirection = Vector.filter(delayedGravityDirection, movementDirection);

    const playerForce = Vector.mults(movementDirection, self.speedMult);

    const gravity = Config.physics.gravity * self.gravityMult;
    const delayedGravityForce = Vector.mults(delayedGravityDirection, gravity);
    const currentGravityForce = Vector.mults(currentGravityDirection, gravity);

    const appliedForce = Vector.divs(
      Vector.add(playerForce, delayedGravityForce),
      Config.physics.variable_multiplyer
    );

    self.speedX = this.performSpeedDrag(
      self.speedX,
      appliedForce.x,
      movementDirection.x,
      currentGravityDirection.y
    );
    self.speedY = this.performSpeedDrag(
      self.speedY,
      appliedForce.y,
      movementDirection.y,
      currentGravityDirection.x
    );

    // the previous section was for the physics direction we're trying to go in
    // here, we apply this regardless of what the previous section has done because
    // boost's gravity overtakes regular gravity
    if (!isFlying) {
      const appliedForce = this.getAppliedForceOf(current);

      if (appliedForce.x) self.speedX = appliedForce.x;
      if (appliedForce.y) self.speedY = appliedForce.y;

      if (self.isDead) {
        self.speedX = 0;
        self.speedY = 0;
      }
    }

    if (!isFlying) {
      let grounded = this.performStepping(self, current, currentGravityDirection);

      // jumping
      this.performJumping(
        self,
        grounded,
        currentGravityForce,
        currentGravityDirection,
        delayedGravityDirection
      );

      this.hoveringOver(self, self.centerEE.x, self.centerEE.y);
    } else {
      self.x += self.speedX;
      self.y += self.speedY;
    }
    // sendMovement(cx, cy);

    // autoalign
    this.performAutoalign(self, appliedForce);
  }

  private performSpeedDrag(
    speed: number,
    modifier: number,
    movement: number,
    currentGravPullOtherAxis: number
  ) {
    // NOTES: we could actually run through this code no matter what, couldn't we?
    // basically if speedx/modifierx is 0, all the multiplication will have no effect
    //
    // if our horizontal speed is changing
    if (speed || modifier) {
      speed += modifier;

      // =-=-=
      // apply different physics drags in different liquids/blocks/etc
      // =-=-=

      // this applies a lot of drag - helps us slow down fast
      speed *= Config.physics.base_drag;
      if (
        // if we have vertical gravitational pull AND we're not moving
        // when would we want both conditions?
        // (self.modY) ||: the drag would ALWAYS be applied (when in air blocks)
        //                 making it really hard to move left/right
        // (!movementX) ||: when there's no vertitcal pull (like on dots),
        //                  the player has just as much grip as when they're on land
        //                  this makes dots not slippery
        (!movement && currentGravPullOtherAxis) ||
        // OR we're going left and want to go right
        // why do we want this? to be able to make hard left->right turns
        (speed < 0 && movement > 0) ||
        // OR we're going right and want to go left
        // why do we want this? to be able to make hard right->left turns
        (speed > 0 && movement < 0)
      ) {
        speed *= Config.physics.no_modifier_drag;
      }

      // clamping speed
      // 16 is the maximum speed allowed before we start phasing through blocks
      if (speed > 16) {
        speed = 16;
      } else if (speed < -16) {
        speed = -16;
      } else if (Math.abs(speed) < 0.0001) {
        speed = 0;
      }
    }

    return speed;
  }

  private performJumping(
    self: Player,
    grounded: boolean,
    currentGravityForce: Vector,
    currentGravity: Vector,
    delayedGravity: Vector
    // origModX: number,
    // modX: number,
    // origModY: number,
    // modY: number
  ) {
    const { x: origModX, y: origModY } = currentGravity;
    const { x: modX, y: modY } = delayedGravity;

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

    if (
      // if either:
      // - we are not moving horizontally but we have horizontal force applied on us
      // - we are not moving vertically but we have vertical force applied on us
      // i think the check for origModX is unnecessary here
      ((self.speedX == 0 && origModX && modX) || (self.speedY == 0 && origModY && modY)) &&
      // and we're grounded
      grounded
    ) {
      // On ground so reset jumps to 0
      self.jumpCount = 0;
    }

    // we needs this here because - what if we never jumped and we're falling?
    // we don't want to let the player jump in mid-air just from falling
    if (self.jumpCount == 0 && !grounded) self.jumpCount = 1; // Not on ground so first 'jump' removed

    if (tryToPerformJump) {
      // if we can jump, AND we're being pulled in the X direction
      //
      // the `origModX` tells us the force of the CURRENT block we're in,
      // and the `modX` tells us the force of the PREVIOUS TICK'S block that we were in.
      //
      // it's very unlikely that that the origModX will differ from modX, so i don't think
      // we need to check both. plus we should only be checking delayed (modX) as physics
      // work based on the previous tick's block (or second prev block, depending on what's in the queue)
      const beingPulledByGravity = (origModX && modX) || (origModY && modY);

      if (self.jumpCount < self.maxJumps && beingPulledByGravity) {
        self.lastJump = self.ticks;
        self.jumpCount += 1;

        if (origModX)
          self.speedX =
            (-currentGravityForce.x * Config.physics.jump_height * self.jumpMult) /
            Config.physics.variable_multiplyer;
        else if (origModY)
          self.speedY =
            (-currentGravityForce.y * Config.physics.jump_height * self.jumpMult) /
            Config.physics.variable_multiplyer;

        if (self.waitedForInitialLongJump === "idle") {
          self.waitedForInitialLongJump = "waiting";
        } else if (self.waitedForInitialLongJump === "waiting") {
          self.waitedForInitialLongJump = "jumped";
        }
      }
    }
  }

  private performStepping(self: Player, current: number, currentGravityDirection: Vector) {
    const speedX = self.speedX,
      x = self.x,
      factoryHorzState = () => ({ pos: x, remainder: x % 1, currentSpeed: speedX });

    const speedY = self.speedY,
      y = self.y,
      factoryVertState = () => ({ pos: y, remainder: y % 1, currentSpeed: speedY });

    let horzGenState = factoryHorzState();
    let vertGenState = factoryVertState();

    let grounded = false;

    let horzStepper = this.stepAlgo(current, horzGenState);
    let horzSteps = 0;

    let vertStepper = this.stepAlgo(current, vertGenState);
    let vertSteps = 0;

    const checkHorzCollision = () => {
      // if we are in collision with any blocks after stepping a singular pixel
      self.x = horzGenState.pos;
      self.y = vertGenState.pos;
      if (this.playerIsInFourSurroundingBlocks(self)) {
        // if we are being pulled to the right,
        // but yet we still have speed to go right that was not yet applied
        // and we are also in collision with a block,
        // we must be grounded!
        if (self.speedX > 0 && currentGravityDirection.x > 0) grounded = true;
        // same for the other direction
        if (self.speedX < 0 && currentGravityDirection.x < 0) grounded = true;

        // we ran into collision so we shouldn't move anymore
        self.speedX = 0;

        // reset our generator to right before it performed this tick
        horzGenState = factoryHorzState();
        horzStepper = this.stepAlgo(current, horzGenState);

        horzSteps--;
        for (let i = 0; i < horzSteps; i++) {
          horzStepper.next();
        }

        doneX = true;
      }
    };

    // same as stepX
    const checkVertCollision = () => {
      self.x = horzGenState.pos;
      self.y = vertGenState.pos;
      if (this.playerIsInFourSurroundingBlocks(self)) {
        if (self.speedY > 0 && currentGravityDirection.y > 0) grounded = true;
        if (self.speedY < 0 && currentGravityDirection.y < 0) grounded = true;

        self.speedY = 0;

        // reset our generator to right before it performed this tick
        vertGenState = factoryVertState();
        vertStepper = this.stepAlgo(current, vertGenState);

        vertSteps--;
        for (let i = 0; i < vertSteps; i++) {
          vertStepper.next();
        }

        doneY = true;
      }
    };

    let doneX = false,
      doneY = false;

    // if we have x speed and we haven't collided yet (or same for y)
    while ((horzGenState.currentSpeed && !doneX) || (vertGenState.currentSpeed && !doneY)) {
      doneX = Boolean(horzStepper.next().done) || doneX;
      horzSteps++;
      checkHorzCollision();

      doneY = Boolean(vertStepper.next().done) || doneY;
      vertSteps++;
      checkVertCollision();
    }

    self.x = horzGenState.pos;
    self.y = vertGenState.pos;

    return grounded;
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
      if (me.remainder + me.currentSpeed < 0 && (me.remainder !== 0 || isBoost(current))) {
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

  performAutoalign(self: Player, appliedForce: Vector) {
    const isSlowSpeed = (n: number) => Math.abs(n) < 1 / 256;
    const pullIsLow = (n: number) => Math.abs(n) < 0.1;

    if (isSlowSpeed(self.speedX) && pullIsLow(appliedForce.x)) {
      self.x = this.tryAutoAlign(self.x);
    }

    if (isSlowSpeed(self.speedY) && pullIsLow(appliedForce.y)) {
      self.y = this.tryAutoAlign(self.y);
    }
  }

  tryAutoAlign(position: number): number {
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

  performZoosts(self: Player, blockX: number, blockY: number, direction: Vector) {
    // snap player to zoost
    let position = new Vector(blockX, blockY);

    const eePos = Vector.mults(position, Config.blockSize);
    self.velocity = Vector.Zero;
    self.x = eePos.x;
    self.y = eePos.y;

    let brokeEarly = false;
    let max = 10; // define arbitrarily high amount of times to iterate before stopping
    while (max) {
      max--;

      const originalPosition = position;
      position = Vector.add(position, direction);

      const collidingWithBorder =
        position.x < 0 ||
        position.y < 0 ||
        position.x >= this.world.size.x ||
        position.y >= this.world.size.y;

      const eePos = Vector.mults(position, Config.blockSize);
      self.x = eePos.x;
      self.y = eePos.y;

      // if we're colliding with a solid block, we need to not to that
      if (collidingWithBorder || !this.noCollision(self, position.x, position.y)) {
        // go back
        position = originalPosition;
        const eePos = Vector.mults(position, Config.blockSize);
        self.x = eePos.x;
        self.y = eePos.y;

        // do we have any other directions we could go?
        const nextDir = self.zoostQueue.shift();

        if (nextDir) {
          // we'll try that direction instead then
          direction = nextDir;
          continue;
        } else {
          break;
        }
      }

      // perform actions (trigger keys/etc)
      this.hoveringOver(self, self.x, self.y);

      if (self.isDead) {
        brokeEarly = true;
        break;
      }
    }

    brokeEarly ||= max === 0;

    // if we broke early, we didn't finish going the queued direction
    if (brokeEarly) {
      self.pushZoostQueue(direction);
    }
  }

  findDotDirection(blockX: number, blockY: number) {
    const actionBlock = this.world.blockAt(blockX, blockY, TileLayer.Action);
    return actionBlock === this.ids.dot ? DotDirection.None : undefined;
  }

  findArrowDirection(blockX: number, blockY: number) {
    const actionBlock = this.world.blockAt(blockX, blockY, TileLayer.Action);

    return actionBlock === this.ids.arrowUp
      ? ArrowDirection.Up
      : actionBlock === this.ids.arrowRight
      ? ArrowDirection.Right
      : actionBlock === this.ids.arrowDown
      ? ArrowDirection.Down
      : actionBlock === this.ids.arrowLeft
      ? ArrowDirection.Left
      : undefined;
  }

  findBoostDirection(blockX: number, blockY: number) {
    const actionBlock = this.world.blockAt(blockX, blockY, TileLayer.Action);

    return actionBlock === this.ids.boostUp
      ? BoostDirection.Up
      : actionBlock === this.ids.boostRight
      ? BoostDirection.Right
      : actionBlock === this.ids.boostDown
      ? BoostDirection.Down
      : actionBlock === this.ids.boostLeft
      ? BoostDirection.Left
      : undefined;
  }

  findZoostDirection(blockX: number, blockY: number) {
    const actionBlock = this.world.blockAt(blockX, blockY, TileLayer.Action);

    return actionBlock === this.ids.zoostUp
      ? ZoostDirection.Up
      : actionBlock === this.ids.zoostRight
      ? ZoostDirection.Right
      : actionBlock === this.ids.zoostDown
      ? ZoostDirection.Down
      : actionBlock === this.ids.zoostLeft
      ? ZoostDirection.Left
      : undefined;
  }

  findSpike(blockX: number, blockY: number) {
    const actionBlock = this.world.blockAt(blockX, blockY, TileLayer.Action);

    return actionBlock === this.ids.spikeUp
      ? SpikeDirection.Up
      : actionBlock === this.ids.spikeRight
      ? SpikeDirection.Right
      : actionBlock === this.ids.spikeDown
      ? SpikeDirection.Down
      : actionBlock === this.ids.spikeLeft
      ? SpikeDirection.Left
      : undefined;
  }

  capIntoWorldBoundaries(self: Player) {
    const previousX = self.position.x;
    const previousY = self.position.y;

    const PLAYER_WIDTH = 32;
    const PLAYER_HEIGHT = 32;

    self.position = Vector.mutateX(
      self.position,
      clamp(self.x, 0, (this.world.size.x - 1) * PLAYER_WIDTH)
    );
    self.position = Vector.mutateY(
      self.position,
      clamp(self.position.y, 0, (this.world.size.y - 1) * PLAYER_HEIGHT)
    );

    if (previousX !== self.position.x) self.velocity = Vector.mutateX(self.velocity, 0);
    if (previousY !== self.position.y) self.velocity = Vector.mutateY(self.velocity, 0);
  }

  cleanup() {
    // this method is relied upon and expected to be called
  }

  playerIsInFourSurroundingBlocks(self: Player): boolean {
    function rectInRect(px: number, py: number, tx: number, ty: number) {
      // lol, im lazy
      tx *= 32;
      ty *= 32;

      // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
      return px < tx + 32 && px + 32 > tx && py < ty + 32 && py + 32 > ty;
    }

    const worldX = Math.floor(self.position.x / 32);
    const worldY = Math.floor(self.position.y / 32);

    const maxX = this.world.size.x;
    const maxY = this.world.size.y;
    const inBounds = (x: number, y: number) => x >= 0 && x < maxX && y >= 0 && y < maxY;

    const has = (x: number, y: number) => (inBounds(x, y) ? !this.noCollision(self, x, y) : true);
    const has00 = has(worldX, worldY);
    const has10 = has(worldX + 1, worldY);
    const has01 = has(worldX, worldY + 1);
    const has11 = has(worldX + 1, worldY + 1);

    return (
      (has00 && rectInRect(self.position.x, self.position.y, worldX, worldY)) ||
      (has10 && rectInRect(self.position.x, self.position.y, worldX + 1, worldY)) ||
      (has01 && rectInRect(self.position.x, self.position.y, worldX, worldY + 1)) ||
      (has11 && rectInRect(self.position.x, self.position.y, worldX + 1, worldY + 1))
    );
  }

  noCollision(self: Player, x: number, y: number): boolean {
    if (self.isInGodMode) {
      return true;
    }

    const fgId = this.world.blockAt(x, y, TileLayer.Foreground);
    const actionId = this.world.blockAt(x, y, TileLayer.Action);

    const [isInsideKeyBlock, redKeyTouchedState] = self.insideKeyBlock;

    let redKeyTouched = this.redKeyOn;
    if (isInsideKeyBlock) {
      redKeyTouched = redKeyTouchedState;
    }

    // TODO: there's got to be a better way to switch the solid-ness of a gate/door
    const keyNotSolid = redKeyTouched ? this.ids.keysRedDoor : this.ids.keysRedGate;

    const isPassthru = (id: number) =>
      id === 0 || id === keyNotSolid || this.ids.tiles.forId(id).isSolid === false;

    return isPassthru(fgId) && isPassthru(actionId);
  }

  hoveringOver(self: Player, inX: number, inY: number) {
    const x = Math.floor(inX / Config.blockSize);
    const y = Math.floor(inY / Config.blockSize);

    const maxX = this.world.size.x;
    const maxY = this.world.size.y;
    const inBounds = (x: number, y: number) => x >= 0 && x < maxX && y >= 0 && y < maxY;

    if (!inBounds(x, y)) {
      self.insideRedKey = false;
      return;
    }

    const deco = this.world.blockAt(x, y, TileLayer.Decoration);
    let currentlyInSign: false | Vector = false;
    if (deco === this.ids.sign) {
      currentlyInSign = { x, y };
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

    const actionBlock = this.world.blockAt(x, y, TileLayer.Action);
    if (this.ids.keysRedKey === actionBlock) {
      if (!self.insideRedKey) {
        this.events.emit("keyTouch", "red", self);
      }

      self.insideRedKey = true;
    } else {
      self.insideRedKey = false;
    }

    if (this.ids.checkpoint === actionBlock) {
      const checkpoint = new Vector(x, y);

      if (!self.hasCheckpoint || !Vector.eq(self.checkpoint!, checkpoint)) {
        this.events.emit("checkpoint", self, checkpoint);
      }

      self.checkpoint = checkpoint;
    }

    if (
      this.ids.spikeUp === actionBlock ||
      this.ids.spikeRight === actionBlock ||
      this.ids.spikeDown === actionBlock ||
      this.ids.spikeLeft === actionBlock
    ) {
      self.kill();
    }

    if (this.isZoost(actionBlock)) {
      self.pushZoostQueue(this.zoostDirToVec(actionBlock));
    }

    const checkInsideKey = (x: number, y: number) => {
      x = Math.floor(x / Config.blockSize);
      y = Math.floor(y / Config.blockSize);
      if (!inBounds(x, y)) return false;

      const foregroundBlock = this.world.blockAt(x, y, TileLayer.Foreground);
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
      checkInsideKey(inX, inY) ||
      checkInsideKey(inX - 16, inY - 16) ||
      checkInsideKey(inX + 15.9, inY - 16) ||
      checkInsideKey(inX - 16, inY + 15.9) ||
      checkInsideKey(inX + 15.9, inY + 15.9);

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

  // so basically boosts while they don't have "gravity" (so they technically
  // aren't pulling you in a direction) have an amount of force they apply instead
  // to the player.
  getAppliedForceOf(block: number) {
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
