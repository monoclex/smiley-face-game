import { Blocks } from "../../game/Blocks";
import { ZSMovement } from "../../packets";
import TileRegistration from "../../tiles/TileRegistration";
import { TileLayer } from "../../types";
import clamp from "../clamp";
import { PhysicsEvent, PhysicsSystem } from "../PhysicsSystem";
import { Player } from "../Player";
import { Vector } from "../Vector";
import { BlockIdCache } from "./BlockIdCache";
import { Config } from "./Config";
import { ArrowDirection, BoostDirection, ZoostDirection, isBoost, isZoost, zoostDirToVec } from "./Directions";

export class EEPhysics implements PhysicsSystem {
  readonly optimalTickRate: number;

  private ticks = 0;
  private tickRedDisabled = 0;

  private ids: BlockIdCache;

  get redKeyOn() {
    return this.ticks < this.tickRedDisabled;
  }

  constructor(
    tiles: TileRegistration,
    private readonly world: Blocks,
    ticksPerSecond: number,
    readonly onPhysicsEvent: (event: PhysicsEvent) => void
  ) {
    this.optimalTickRate = 1000 / ticksPerSecond;
    this.ids = new BlockIdCache(tiles);
  }

  update(elapsedMs: number, players: Player[]) {
    while ((this.ticks + 1) * this.optimalTickRate <= elapsedMs) {
      this.tick(players);
    }
  }

  triggerKey(kind: "red", deactivateTime: number, player: Player): void {
    this.tickRedDisabled = deactivateTime;
  }

  updatePlayer(movement: ZSMovement, player: Player): void {
    player.position = movement.position;
    player.velocity = movement.velocity;
    player.input = movement.inputs;
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
    self.horizontal = ((self.input.right && 1) || 0) - ((self.input.left && 1) || 0);
    self.vertical = ((self.input.down && 1) || 0) - ((self.input.up && 1) || 0);
    self.isSpaceJustPressed = !self.isSpaceDown && self.input.jump;
    self.isSpaceDown = self.input.jump;

    const blockX = Math.round(self.x / Config.blockSize);
    const blockY = Math.round(self.y / Config.blockSize);

    const delayed = self.queue.shift();
    if (delayed === undefined) throw new Error("impossible");
    const current = this.findGravityDirection(blockX, blockY);
    self.queue.push(current);

    if (isZoost(current)) {
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

      let direction = zoostDirToVec(current);

      const tryDirs: Vector[] = [];

      // only allowed to advance at most 10 times per ee tick
      let advanceNum = 10;
      while (advanceNum > 0) {
        const originalPosition = position;
        position = Vector.add(position, direction);
        position = new Vector(clamp(position.x, 0, this.world.size.x - 1), clamp(position.y, 0, this.world.size.y - 1));

        const eePos = Vector.mults(position, Config.blockSize);
        self.x = eePos.x;
        self.y = eePos.y;

        // this is already done cuz we clamp the `position`
        // self.capIntoWorldBoundaries(game);

        // if we're colliding with a solid block, we need to not to that
        const block = this.world.blockAt(position.x, position.y, TileLayer.Foreground);
        if (!this.noCollision(self, block)) {
          // go back
          position = originalPosition;
          const eePos = Vector.mults(position, Config.blockSize);
          self.x = eePos.x;
          self.y = eePos.y;

          // do we have any other directions we could go?
          const nextDir = tryDirs.shift();
          if (nextDir) {
            // we'll try that direction instead then
            direction = nextDir;
            advanceNum--;
            continue;
          }
        }

        // if this is a zoost, record it as a possible direction to take
        const newDir = this.findGravityDirection(position.x, position.y);
        if (isZoost(newDir)) {
          tryDirs.push(zoostDirToVec(newDir));
          advanceNum--;
          continue;
        }

        // otherwise, perform actions (trigger keys/etc)
        this.hoveringOver(self, self.x, self.y);
        advanceNum--;
      }

      return;
    }

    let modifierX = 0,
      modifierY = 0;

    // let isFlying = self.isInGodMode;
    const isFlying = false;
    if (!isFlying) {
      self.origModX = self.modX;
      self.origModY = self.modY;

      // EE comment: "Process gravity"
      switch (current) {
        case ArrowDirection.Left:
          self.origModX = -Config.physics.gravity;
          self.origModY = 0;
          break;
        case ArrowDirection.Up:
          self.origModX = 0;
          self.origModY = -Config.physics.gravity;
          break;
        case ArrowDirection.Right:
          self.origModX = Config.physics.gravity;
          self.origModY = 0;
          break;
        case ArrowDirection.Down:
        default:
          self.origModX = 0;
          self.origModY = Config.physics.gravity;
          break;
        case BoostDirection.Left:
        case BoostDirection.Up:
        case BoostDirection.Right:
        case BoostDirection.Down:
          self.origModX = 0;
          self.origModY = 0;
          break;
      }

      switch (delayed) {
        case ArrowDirection.Left:
          self.modX = -Config.physics.gravity;
          self.modY = 0;
          break;
        case ArrowDirection.Up:
          self.modX = 0;
          self.modY = -Config.physics.gravity;
          break;
        case ArrowDirection.Right:
          self.modX = Config.physics.gravity;
          self.modY = 0;
          break;
        case ArrowDirection.Down:
        default:
          self.modX = 0;
          self.modY = Config.physics.gravity;
          break;
        case BoostDirection.Left:
        case BoostDirection.Up:
        case BoostDirection.Right:
        case BoostDirection.Down:
          self.modX = 0;
          self.modY = 0;
          break;
      }
    }

    let movementX = 0,
      movementY = 0;

    if (self.modY) {
      movementX = self.horizontal;
      movementY = 0;
    } else if (self.modX) {
      movementX = 0;
      movementY = self.vertical;
    } else {
      movementX = self.horizontal;
      movementY = self.vertical;
    }
    movementX *= self.speedMult;
    movementY *= self.speedMult;
    self.modX *= self.gravityMult;
    self.modY *= self.gravityMult;

    modifierX = (self.modX + movementX) / Config.physics.variable_multiplyer;
    modifierY = (self.modY + movementY) / Config.physics.variable_multiplyer;

    if (self.speedX || modifierX) {
      self.speedX += modifierX;

      self.speedX *= Config.physics.base_drag;
      if ((!movementX && self.modY) || (self.speedX < 0 && movementX > 0) || (self.speedX > 0 && movementX < 0)) {
        self.speedX *= Config.physics.no_modifier_drag;
      }

      if (self.speedX > 16) {
        self.speedX = 16;
      } else if (self.speedX < -16) {
        self.speedX = -16;
      } else if (Math.abs(self.speedX) < 0.0001) {
        self.speedX = 0;
      }
    }

    if (self.speedY || modifierY) {
      self.speedY += modifierY;

      self.speedY *= Config.physics.base_drag;
      if ((!movementY && self.modX) || (self.speedY < 0 && movementY > 0) || (self.speedY > 0 && movementY < 0)) {
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

    if (!isFlying) {
      switch (this.findBoostDirection(blockX, blockY)) {
        case BoostDirection.Left:
          self.speedX = -Config.physics.boost;
          break;
        case BoostDirection.Right:
          self.speedX = Config.physics.boost;
          break;
        case BoostDirection.Up:
          self.speedY = -Config.physics.boost;
          break;
        case BoostDirection.Down:
          self.speedY = Config.physics.boost;
          break;
      }

      const isDead = false;
      if (isDead) {
        self.speedX = 0;
        self.speedY = 0;
      }
    }

    let remainderX = self.x % 1,
      remainderY = self.y % 1;
    let currentSX = self.speedX,
      currentSY = self.speedY;
    let oldSX = 0,
      oldSY = 0;
    let oldX = 0,
      oldY = 0;

    let doneX = false,
      doneY = false;

    let grounded = false;

    const stepX = () => {
      if (currentSX > 0) {
        if (currentSX + remainderX >= 1) {
          self.x += 1 - remainderX;
          self.x >>= 0;
          currentSX -= 1 - remainderX;
          remainderX = 0;
        } else {
          self.x += currentSX;
          currentSX = 0;
        }
      } else if (currentSX < 0) {
        if (remainderX + currentSX < 0 && (remainderX != 0 || isBoost(current))) {
          currentSX += remainderX;
          self.x -= remainderX;
          self.x >>= 0;
          remainderX = 1;
        } else {
          self.x += currentSX;
          currentSX = 0;
        }
      }
      if (this.playerIsInFourSurroundingBlocks(self)) {
        // if(self.playstate.world != null){
        // if(self.playstate.world.overlaps(this)){
        self.x = oldX;
        if (self.speedX > 0 && self.origModX > 0) grounded = true;
        if (self.speedX < 0 && self.origModX < 0) grounded = true;

        self.speedX = 0;
        currentSX = oldSX;
        doneX = true;
      }
    };
    const stepY = () => {
      if (currentSY > 0) {
        if (currentSY + remainderY >= 1) {
          self.y += 1 - remainderY;
          self.y >>= 0;
          currentSY -= 1 - remainderY;
          remainderY = 0;
        } else {
          self.y += currentSY;
          currentSY = 0;
        }
      } else if (currentSY < 0) {
        if (remainderY + currentSY < 0 && (remainderY != 0 || isBoost(current))) {
          currentSY += remainderY;
          self.y -= remainderY;
          self.y >>= 0;
          remainderY = 1;
        } else {
          self.y += currentSY;
          currentSY = 0;
        }
      }
      if (this.playerIsInFourSurroundingBlocks(self)) {
        // if(self.playstate.world != null){
        // if(self.playstate.world.overlaps(this)){
        self.y = oldY;
        if (self.speedY > 0 && self.origModY > 0) grounded = true;
        if (self.speedY < 0 && self.origModY < 0) grounded = true;

        self.speedY = 0;
        currentSY = oldSY;
        doneY = true;
      }
    };

    while ((currentSX && !doneX) || (currentSY && !doneY)) {
      oldX = self.x;
      oldY = self.y;

      oldSX = currentSX;
      oldSY = currentSY;

      stepX();
      stepY();
    }

    // jumping
    let mod = 1;
    let inJump = false;
    if (self.isSpaceJustPressed) {
      self.lastJump = -self.ticks;
      inJump = true;
      mod = -1;
    }

    if (self.isSpaceDown) {
      if (self.lastJump < 0) {
        if (self.ticks + self.lastJump > 75) {
          inJump = true;
        }
      } else {
        if (self.ticks - self.lastJump > 15) {
          inJump = true;
        }
      }
    }

    if (((self.speedX == 0 && self.origModX && self.modX) || (self.speedY == 0 && self.origModY && self.modY)) && grounded) {
      // On ground so reset jumps to 0
      self.jumpCount = 0;
    }

    if (self.jumpCount == 0 && !grounded) self.jumpCount = 1; // Not on ground so first 'jump' removed

    if (inJump) {
      if (self.jumpCount < self.maxJumps && self.origModX && self.modX) {
        // Jump in x direction
        if (self.maxJumps < 1000) {
          // Not infinite jumps
          self.jumpCount += 1;
        }
        self.speedX = (-self.origModX * Config.physics.jump_height * self.jumpMult) / Config.physics.variable_multiplyer;
        self.lastJump = self.ticks * mod;
      }
      if (self.jumpCount < self.maxJumps && self.origModY && self.modY) {
        // Jump in y direction
        if (self.maxJumps < 1000) {
          // Not infinite jumps
          self.jumpCount += 1;
        }
        self.speedY = (-self.origModY * Config.physics.jump_height * self.jumpMult) / Config.physics.variable_multiplyer;
        self.lastJump = self.ticks * mod;
      }
    }

    if (!isFlying) {
      this.hoveringOver(self, self.center.x, self.center.y);
    }
    // sendMovement(cx, cy);

    // autoalign
    const imx = (self.speedX * 256) >> 0;
    const imy = (self.speedY * 256) >> 0;

    if (imx != 0) {
      self.moving = true;
    } else if (Math.abs(modifierX) < 0.1) {
      const tx = self.x % Config.blockSize;
      if (tx < Config.physics.autoalign_range) {
        if (tx < Config.physics.autoalign_snap_range) {
          self.x >>= 0;
        } else self.x -= tx / (Config.blockSize - 1);
      } else if (tx > Config.blockSize - Config.physics.autoalign_range) {
        if (tx > Config.blockSize - Config.physics.autoalign_snap_range) {
          self.x >>= 0;
          self.x++;
        } else self.x += (tx - (Config.blockSize - Config.physics.autoalign_range)) / (Config.blockSize - 1);
      }
    }

    if (imy != 0) {
      self.moving = true;
    } else if (Math.abs(modifierY) < 0.1) {
      const ty = self.y % Config.blockSize;
      if (ty < Config.physics.autoalign_range) {
        if (ty < Config.physics.autoalign_snap_range) {
          self.y >>= 0;
        } else self.y -= ty / (Config.blockSize - 1);
      } else if (ty > Config.blockSize - Config.physics.autoalign_range) {
        if (ty > Config.blockSize - Config.physics.autoalign_snap_range) {
          self.y >>= 0;
          self.y++;
        } else self.y += (ty - (Config.blockSize - Config.physics.autoalign_range)) / (Config.blockSize - 1);
      }
    }
  }

  findGravityDirection(worldX: number, worldY: number) {
    // const worldX = Math.floor(this.center.x / 32);
    // const worldY = Math.floor(this.center.y / 32);

    return (
      this.findBoostDirection(worldX, worldY) ||
      this.findZoostDirection(worldX, worldY) ||
      this.findArrowDirection(worldX, worldY) ||
      ArrowDirection.Down
    );
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
      : actionBlock === this.ids.zoostRight
      ? ZoostDirection.Down
      : actionBlock === this.ids.zoostLeft
      ? ZoostDirection.Left
      : undefined;
  }

  capIntoWorldBoundaries(self: Player) {
    const previousX = self.position.x;
    const previousY = self.position.y;

    const PLAYER_WIDTH = 32;
    const PLAYER_HEIGHT = 32;

    self.position = Vector.mutateX(self.position, clamp(self.x, 0, (this.world.size.x - 1) * PLAYER_WIDTH));
    self.position = Vector.mutateY(self.position, clamp(self.position.y, 0, (this.world.size.y - 1) * PLAYER_HEIGHT));

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

    const has = (x: number, y: number) => (inBounds(x, y) ? !this.noCollision(self, this.world.blockAt(x, y, TileLayer.Foreground)) : true);
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

  noCollision(self: Player, blockId: number): boolean {
    const [isInsideKeyBlock, redKeyTouchedState] = self.insideKeyBlock;

    let redKeyTouched = this.redKeyOn;
    if (isInsideKeyBlock) {
      redKeyTouched = redKeyTouchedState;
    }

    // TODO: there's got to be a better way to switch the solid-ness of a gate/door
    const keySolid = redKeyTouched ? this.ids.keysRedDoor : this.ids.keysRedGate;
    return blockId === 0 || blockId === this.ids.keysRedKey || blockId === keySolid;
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

    const foregroundBlock = this.world.blockAt(x, y, TileLayer.Foreground);

    if (this.ids.keysRedKey === foregroundBlock) {
      if (!self.insideRedKey) {
        this.onPhysicsEvent({ type: "key", presser: self, key: "red" });
      }

      self.insideRedKey = true;
    } else {
      self.insideRedKey = false;
    }

    const checkInsideKey = (x: number, y: number) => {
      x = Math.floor(x / Config.blockSize);
      y = Math.floor(y / Config.blockSize);
      if (!inBounds(x, y)) return false;

      const actionBlock = this.world.blockAt(x, y, TileLayer.Action);

      if (this.ids.keysRedDoor === actionBlock || this.ids.keysRedGate === actionBlock) {
        const [prevInsideKeyBlock, _] = self.insideKeyBlock;

        if (!prevInsideKeyBlock) {
          self.insideKeyBlock = [true, this.redKeyOn];
        }
        return true;
      } else {
        return false;
      }
    };

    // lol this is such a hack
    const didUpdateInsideKey =
      checkInsideKey(inX - 16, inY - 16) ||
      checkInsideKey(inX + 15.9, inY - 16) ||
      checkInsideKey(inX - 16, inY + 15.9) ||
      checkInsideKey(inX + 15.9, inY + 15.9);

    if (!didUpdateInsideKey) {
      self.insideKeyBlock = [false, false];
    }
  }
}
