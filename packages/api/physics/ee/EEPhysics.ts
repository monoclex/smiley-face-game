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

    // take user input
    self.horizontal = Number(self.input.right) - Number(self.input.left);
    self.vertical = Number(self.input.down) - Number(self.input.up);
    self.isSpaceJustPressed = !self.isSpaceDown && self.input.jump;
    self.isSpaceDown = self.input.jump;

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

    if (!isFlying) {
      let direction = self.zoostQueue.shift();
      if (direction != null) {
        this.performZoosts(self, blockX, blockY, direction);
        return;
      }

      self.origModX = self.modX;
      self.origModY = self.modY;

      const currentGravitationalPull = this.getGravitationalPull(current);
      self.origModX = currentGravitationalPull.x;
      self.origModY = currentGravitationalPull.y;

      if (
        current == this.ids.spikeUp ||
        current == this.ids.spikeRight ||
        current == this.ids.spikeDown ||
        current == this.ids.spikeLeft
      ) {
        self.kill();
      }

      const delayedGravitationalPull = this.getGravitationalPull(delayed);
      self.modX = delayedGravitationalPull.x;
      self.modY = delayedGravitationalPull.y;
    }

    let movementX = 0,
      movementY = 0;

    // if we are being pulled vertically (so gravity)
    if (self.modY) {
      // allow the player to move horizontally
      movementX = self.horizontal;
      // but not vertically
      movementY = 0;
    }
    // if we are being pulled horiontally (gravity)
    else if (self.modX) {
      // do not allow the player to fight gravity
      movementX = 0;
      // but we can move vertically
      movementY = self.vertical;
    }
    // we're not being pulled in any direction
    else {
      // allow the player to move in any direction
      movementX = self.horizontal;
      movementY = self.vertical;
    }

    movementX *= self.speedMult;
    movementY *= self.speedMult;
    self.modX *= self.gravityMult;
    self.modY *= self.gravityMult;

    // the current gravitational pull (modX) plus the force the player is applying (movementX)
    // divided by "Config.physics.variable_multiplyer" for some reason
    let modifierX = (self.modX + movementX) / Config.physics.variable_multiplyer;
    let modifierY = (self.modY + movementY) / Config.physics.variable_multiplyer;

    // NOTES: we could actually run through this code no matter what, couldn't we?
    // basically if speedx/modifierx is 0, all the multiplication will have no effect
    //
    // if our horizontal speed is changing
    if (self.speedX || modifierX) {
      self.speedX += modifierX;

      self.speedX *= Config.physics.base_drag;

      // =-=-=
      // apply different physics drags in different liquids/blocks/etc
      // =-=-=

      // this applies a lot of drag - helps us slow down fast
      if (
        // if we have vertical gravitational pull AND we're not moving
        // when would we want both conditions?
        // (self.modY) ||: the drag would ALWAYS be applied (when in air blocks)
        //                 making it really hard to move left/right
        // (!movementX) ||: when there's no vertitcal pull (like on dots),
        //                  the player has just as much grip as when they're on land
        //                  this makes dots not slippery
        (!movementX && self.modY) ||
        // OR we're going left and want to go right
        // why do we want this? to be able to make hard left->right turns
        (self.speedX < 0 && movementX > 0) ||
        // OR we're going right and want to go left
        // why do we want this? to be able to make hard right->left turns
        (self.speedX > 0 && movementX < 0)
      ) {
        self.speedX *= Config.physics.no_modifier_drag;
      }

      // clamping speed
      // 16 is the maximum speed allowed before we start phasing through blocks
      if (self.speedX > 16) {
        self.speedX = 16;
      } else if (self.speedX < -16) {
        self.speedX = -16;
      }
      // if our speed is really tiny we want to round that to 0 so we don't move
      else if (Math.abs(self.speedX) < 0.0001) {
        self.speedX = 0;
      }
    }

    // same case as previous section (lol duplicated code)
    if (self.speedY || modifierY) {
      self.speedY += modifierY;

      self.speedY *= Config.physics.base_drag;
      if (
        (!movementY && self.modX) ||
        (self.speedY < 0 && movementY > 0) ||
        (self.speedY > 0 && movementY < 0)
      ) {
        self.speedY *= Config.physics.no_modifier_drag;
      }

      if (self.speedY > 16) {
        self.speedY = 16;
      } else if (self.speedY < -16) {
        self.speedY = -16;
      } else if (Math.abs(self.speedY) < 0.0001) {
        self.speedY = 0;
      }
    }

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

    let grounded = this.performStepping(self, current);

    // jumping
    this.performJumping(self, grounded);

    if (!isFlying) {
      this.hoveringOver(self, self.centerEE.x, self.centerEE.y);
    }
    // sendMovement(cx, cy);

    // autoalign
    this.performAutoalign(self, modifierX, modifierY);
  }

  private performJumping(self: Player, grounded: boolean) {
    let tryToPerformJump = false;

    // if space has just been pressed, we want to jump immediately
    if (self.isSpaceJustPressed) {
      tryToPerformJump = true;
    }
    // otherwise, if space has been (or is just) held
    else if (self.isSpaceDown) {
      // if lastJump is negative, meaning
      // it is only negative if `isSpaceJustPressed` has been the "most recently"
      // pressed thing
      if (self.jumpCount === 1) {
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
      ((self.speedX == 0 && self.origModX && self.modX) ||
        (self.speedY == 0 && self.origModY && self.modY)) &&
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
      const beingPulledByGravity = (self.origModX && self.modX) || (self.origModY && self.modY);

      if (self.jumpCount < self.maxJumps && beingPulledByGravity) {
        self.lastJump = self.ticks;
        self.jumpCount += 1;

        if (self.origModX)
          self.speedX =
            (-self.origModX * Config.physics.jump_height * self.jumpMult) /
            Config.physics.variable_multiplyer;

        if (self.origModY)
          self.speedY =
            (-self.origModY * Config.physics.jump_height * self.jumpMult) /
            Config.physics.variable_multiplyer;
      }
    }
  }

  private performStepping(self: Player, current: number) {
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
        if (self.speedX > 0 && self.origModX > 0) grounded = true;
        // same for the other direction
        if (self.speedX < 0 && self.origModX < 0) grounded = true;

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
        if (self.speedY > 0 && self.origModY > 0) grounded = true;
        if (self.speedY < 0 && self.origModY < 0) grounded = true;

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

      if (me.remainder !== 0 || isBoost(current)) {
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

  performAutoalign(self: Player, modifierX: number, modifierY: number) {
    // makes it so `imx` is `>= 1` when `self.speedX` is `>= 0.00390625`
    // i guess when we start applying auto align is if our speed is `< 0.00390625`... ok?
    const imx = (self.speedX * 256) >> 0;
    const imy = (self.speedY * 256) >> 0;

    // if our speed is not within a slow enough threshold, don't autoalign
    // if the force that's being applied to us is small enough,
    if (imx == 0 && Math.abs(modifierX) < 0.1) {
      // time to apply auto align

      // how far off of a block we are
      const tx = self.x % Config.blockSize;
      // if we're close to the left side of a block
      if (tx < Config.physics.autoalign_range) {
        // within snapping range? snap ourselves to be exactly on the block
        if (tx < Config.physics.autoalign_snap_range) {
          self.x >>= 0;
        } else {
          // otherwise, gradually inch towards that block
          // we know `tx \in [0.2, 2)`
          // so this will be at least 0.2/15 (0.0133...) and at most 2/15 (0.1333...)
          // the farther away you are the stronger it pulls you
          self.x -= tx / (Config.blockSize - 1);
        }
      }
      // but if you're close to the right side
      else if (tx > Config.blockSize - Config.physics.autoalign_range) {
        // if you're within the snap range
        if (tx > Config.blockSize - Config.physics.autoalign_snap_range) {
          // it snaps you to that block
          self.x >>= 0;
          self.x++;
        } else {
          // otherwise, it inches you there
          // uses the same mechanism as the other branch, except switched
          self.x +=
            (tx - (Config.blockSize - Config.physics.autoalign_range)) / (Config.blockSize - 1);
        }
      }
    }

    if (imy == 0 && Math.abs(modifierY) < 0.1) {
      const ty = self.y % Config.blockSize;
      if (ty < Config.physics.autoalign_range) {
        if (ty < Config.physics.autoalign_snap_range) {
          self.y >>= 0;
        } else self.y -= ty / (Config.blockSize - 1);
      } else if (ty > Config.blockSize - Config.physics.autoalign_range) {
        if (ty > Config.blockSize - Config.physics.autoalign_snap_range) {
          self.y >>= 0;
          self.y++;
        } else
          self.y +=
            (ty - (Config.blockSize - Config.physics.autoalign_range)) / (Config.blockSize - 1);
      }
    }

    // self.y -= ty / denom
    // self.y += (ty - (16 - r)) / denom

    // self.y += -ty / denom
    // self.y += (ty - (16 - r)) / denom

    // to = 16 - ty
    // e = (ty - (16 - r))
    // e = ty - 16 + r
    // -e = -ty + 16 - r
    // -e = 16 - ty - r
    // -e = to - r
    // e = r - to

    // self.y += -ty / denom
    // self.y += (r - to) / denom
  }

  tryAutoAlign(position: number): number {
    // handle auto aligning close to left side
    const blockOffset = position % Config.blockSize;
    if (blockOffset < Config.physics.autoalign_snap_range) {
      return Math.floor(position);
    }

    if (blockOffset < Config.physics.autoalign_range) {
      const nudgeNum = -blockOffset;

      const nudge = nudgeNum / (Config.blockSize - 1);
      return position + nudge;
    }

    // handle auto aligning close to right side
    const oppositeBlockOffset = 16 - blockOffset;
    if (oppositeBlockOffset < Config.physics.autoalign_snap_range) {
      return Math.ceil(position);
    }

    if (oppositeBlockOffset < Config.physics.autoalign_range) {
      const nudgeNum = Config.physics.autoalign_range - oppositeBlockOffset;

      const nudge = nudgeNum / (Config.blockSize - 1);
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
    self.modX = 0;
    self.modY = 0;
    self.origModX = 0;
    self.origModY = 0;

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

  getGravitationalPull(blockId: number) {
    const gravity = new Vector(Config.physics.gravity, Config.physics.gravity);

    switch (blockId) {
      case this.ids.boostUp:
      case this.ids.boostRight:
      case this.ids.boostLeft:
      case this.ids.boostDown:
      case this.ids.dot:
        return Vector.Zero;
      case this.ids.arrowUp:
        return Vector.mult(Vector.Up, gravity);
      case this.ids.arrowRight:
        return Vector.mult(Vector.Right, gravity);
      case this.ids.arrowLeft:
        return Vector.mult(Vector.Left, gravity);
      case this.ids.arrowDown:
      case this.ids.spikeUp:
      case this.ids.spikeRight:
      case this.ids.spikeLeft:
      case this.ids.spikeDown:
      default:
        return Vector.mult(Vector.Down, gravity);
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
