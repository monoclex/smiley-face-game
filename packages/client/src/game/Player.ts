import { TileLayer } from "@smiley-face-game/api/types";
import Position from "./interfaces/Position";
import Velocity from "./interfaces/Velocity";
import Inputs from "./interfaces/Inputs";
import PhysicsObject from "./interfaces/PhysicsObject";
import defaultInputs from "./helpers/defaultInputs";
import Game from "./Game";
import clamp from "./helpers/clamp";
import Vector from "./physics/Vector";

class Config {
  static blockSize = 16;
  static smileySize = 26;
  static godmodeSize = 64;

  static fontVisitorSize = 8;
  static fontNokiaSize = 13;

  static smileyRows = 2;

  static fullWidth = 850;
  static fullHeight = 500;

  static gameWidth = 640;
  static gameHeight = 470;

  //game width&height rounded up to the next multiple of block size
  //prevents glitchy offsets when moving blocks in the game container
  static gameWidthCeil = Config.blockSize * Math.ceil(Config.gameWidth / Config.blockSize);
  static gameHeightCeil = Config.blockSize * Math.ceil(Config.gameHeight / Config.blockSize);

  static camera_lag = 1 / 16;

  static physics = {
    ms_per_tick: 10,
    max_ticks_per_frame: 150,
    variable_multiplyer: 7.752,

    base_drag: Math.pow(0.9981, 10) * 1.00016093,
    ice_no_mod_drag: Math.pow(0.9993, 10) * 1.00016093,
    ice_drag: Math.pow(0.9998, 10) * 1.00016093,
    //Multiplyer when not applying force by userkeys
    no_modifier_drag: Math.pow(0.99, 10) * 1.00016093,
    water_drag: Math.pow(0.995, 10) * 1.00016093,
    mud_drag: Math.pow(0.975, 10) * 1.00016093,
    lava_drag: Math.pow(0.98, 10) * 1.00016093,
    toxic_drag: Math.pow(0.99, 10) * 1.00016093,
    jump_height: 26,

    autoalign_range: 2,
    autoalign_snap_range: 0.2,

    gravity: 2,
    boost: 16,
    water_buoyancy: -0.5,
    mud_buoyancy: 0.4,
    lava_buoyancy: 0.2,
    toxic_buoyancy: -0.4,
  };
}
Object.freeze(Config.physics);
Object.freeze(Config);

enum GunState {
  None,
  Carrying,
  Held,
}

// const enum equivalent
const ArrowDirection = {
  Up: 0,
  Right: 1,
  Down: 2,
  Left: 3,
};
const BoostDirection = {
  Up: 4,
  Right: 5,
  Down: 6,
  Left: 7,
};
const isBoost = (boostDirection: number) => boostDirection >= BoostDirection.Up && boostDirection <= BoostDirection.Left;
const ZoostDirection = {
  Up: 8,
  Right: 9,
  Down: 10,
  Left: 11,
};
const isZoost = (zoostDirection: number) => zoostDirection >= ZoostDirection.Up && zoostDirection <= ZoostDirection.Left;
const zoostDirToVec = (zoostDirection: number): Vector => {
  // prettier-ignore
  switch (zoostDirection) {
    case ZoostDirection.Up:    return Vector.Up;
    case ZoostDirection.Down:  return Vector.Down;
    case ZoostDirection.Left:  return Vector.Left;
    case ZoostDirection.Right: return Vector.Right;
    default:
      throw new Error("should not reach this");
  }
};

function hackyMapGunStateToString(g: GunState): "none" | "carrying" | "held" {
  if (g === GunState.None) return "none";
  else if (g === GunState.Carrying) return "carrying";
  else if (g === GunState.Held) return "held";
  else throw new Error("unreachable");
}

export default class Player implements PhysicsObject {
  position: Position = { x: 0, y: 0 };
  velocity: Velocity = { x: 0, y: 0 };
  input: Inputs = defaultInputs();
  gravityDirection: number = ArrowDirection.Down;
  gunAngle = 0;
  _role: "non" | "edit" | "staff" | "owner" = "non";
  private _gunState: GunState = 0;

  private get gunState(): GunState {
    return this._gunState;
  }

  private set gunState(value: GunState) {
    if (this.onGunStateChange) {
      this.onGunStateChange(hackyMapGunStateToString(this.gunState), hackyMapGunStateToString(value));
    }

    this._gunState = value;
  }

  // TODO: have events for entering **all** blocks
  onEnterGun?: (x: number, y: number) => void;

  // TODO: have a way to subscribe to *all* state changes (**DON'T** JUST HAVE ONE CALLBACK PER STAT)
  onGunStateChange?: (previous: "none" | "carrying" | "held", current: "none" | "carrying" | "held") => void;

  // TODO: see above todo
  onRoleChange?: (previous: "non" | "edit" | "staff" | "owner", current: "non" | "edit" | "staff" | "owner") => void;

  get hasGun(): boolean {
    return this.gunState >= GunState.Carrying;
  }

  get isGunHeld(): boolean {
    return this.gunState === GunState.Held;
  }

  get hasEdit(): boolean {
    return this.role === "edit" || this.role === "owner";
  }

  // TODO: jesus christ this is a lot of getters at this point, is this really the way?
  get center(): Position {
    // TODO: don't hardcode 16
    return { x: this.position.x + 16, y: this.position.y + 16 };
  }

  get role(): "non" | "edit" | "staff" | "owner" {
    return this._role;
  }

  set role(value: "non" | "edit" | "staff" | "owner") {
    if (this.onRoleChange) {
      this.onRoleChange(this._role, value);
    }
    this._role = value;
  }

  constructor(readonly id: number, readonly username: string, readonly isGuest: boolean) {}

  pickupGun() {
    if (this.hasGun) throw new Error("picked up gun when already have a gun");

    // as soon as we pick up a gun we are holding it
    this.gunState = GunState.Held;
  }

  // TODO: use setters
  holdGun(isHeld: boolean) {
    if (!this.hasGun) throw new Error("can't hold gun when there is no gun");
    this.gunState = isHeld ? GunState.Held : GunState.Carrying;
  }

  private deltaAccum = 0;
  tick(game: Game, deltaMs: number) {
    // 100 ticks per second
    // 10 ticks per 100ms
    // 1 tick per 10ms
    this.deltaAccum += deltaMs;

    while (this.deltaAccum >= 10) {
      this.deltaAccum -= 10;
      this.eetick(game);
    }
  }

  private horizontal = 0;
  private vertical = 0;
  private isSpaceDown = false;
  private isSpaceJustPressed = false;
  private speedMult = 1;
  private gravityMult = 1;
  private speedX = 0;
  private speedY = 0;
  private get x(): number {
    return this.position.x / 2;
  }
  private set x(x: number) {
    this.position.x = x * 2;
  }
  private get y(): number {
    return this.position.y / 2;
  }
  private set y(y: number) {
    this.position.y = y * 2;
  }
  private ticks = 0;
  private lastJump = 0;
  private jumpCount = 0;
  private maxJumps = 1;
  private jumpMult = 1;
  private moving = false;
  private queue: number[] = [ArrowDirection.Down];
  private origModX = 0;
  private origModY = 0;
  private modX = 0;
  private modY = 0;
  eetick(game: Game) {
    this.horizontal = ((this.input.right && 1) || 0) - ((this.input.left && 1) || 0);
    this.vertical = ((this.input.down && 1) || 0) - ((this.input.up && 1) || 0);
    this.isSpaceJustPressed = !this.isSpaceDown && this.input.jump;
    this.isSpaceDown = this.input.jump;

    const blockX = Math.round(this.x / Config.blockSize);
    const blockY = Math.round(this.y / Config.blockSize);

    const delayed = this.queue.shift();
    if (delayed === undefined) throw new Error("impossible");
    const current = this.findGravityDirection(blockX, blockY, game);
    this.queue.push(current);

    if (isZoost(current)) {
      // snap player to zoost
      let position = new Vector(blockX, blockY);

      const eePos = position.mults(Config.blockSize);
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.x = eePos.x;
      this.y = eePos.y;
      this.modX = 0;
      this.modY = 0;
      this.origModX = 0;
      this.origModY = 0;

      let direction = zoostDirToVec(current);

      const tryDirs: Vector[] = [];

      // only allowed to advance at most 10 times per ee tick
      let advanceNum = 10;
      while (advanceNum > 0) {
        position = position.add(direction);
        position = new Vector(clamp(position.x, 0, game.world.size.width - 1), clamp(position.y, 0, game.world.size.height - 1));

        const eePos = position.mults(Config.blockSize);
        this.x = eePos.x;
        this.y = eePos.y;

        // this is already done cuz we clamp the `position`
        // this.capIntoWorldBoundaries(game);

        // if we're colliding with a solid block, we need to not to that
        const block = game.world.blockAt(position.x, position.y, TileLayer.Foreground);
        if (!this.noCollision(game, block)) {
          // take a step back
          position = position.sub(direction);
          position = new Vector(clamp(position.x, 0, game.world.size.width - 1), clamp(position.y, 0, game.world.size.height - 1));
          const eePos = position.mults(Config.blockSize);
          this.x = eePos.x;
          this.y = eePos.y;

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
        const newDir = this.findGravityDirection(position.x, position.y, game);
        if (isZoost(newDir)) {
          tryDirs.push(zoostDirToVec(newDir));
          advanceNum--;
          continue;
        }

        // otherwise, perform actions (trigger keys/etc)
        this.hoveringOver(game, this.x, this.y);
        advanceNum--;
      }

      return;
    }

    let modifierX = 0,
      modifierY = 0;

    // let isFlying = this.isInGodMode;
    const isFlying = false;
    if (!isFlying) {
      this.origModX = this.modX;
      this.origModY = this.modY;

      // EE comment: "Process gravity"
      switch (current) {
        case ArrowDirection.Left:
          this.origModX = -Config.physics.gravity;
          this.origModY = 0;
          break;
        case ArrowDirection.Up:
          this.origModX = 0;
          this.origModY = -Config.physics.gravity;
          break;
        case ArrowDirection.Right:
          this.origModX = Config.physics.gravity;
          this.origModY = 0;
          break;
        case ArrowDirection.Down:
        default:
          this.origModX = 0;
          this.origModY = Config.physics.gravity;
          break;
        case BoostDirection.Left:
        case BoostDirection.Up:
        case BoostDirection.Right:
        case BoostDirection.Down:
          this.origModX = 0;
          this.origModY = 0;
          break;
      }

      switch (delayed) {
        case ArrowDirection.Left:
          this.modX = -Config.physics.gravity;
          this.modY = 0;
          break;
        case ArrowDirection.Up:
          this.modX = 0;
          this.modY = -Config.physics.gravity;
          break;
        case ArrowDirection.Right:
          this.modX = Config.physics.gravity;
          this.modY = 0;
          break;
        case ArrowDirection.Down:
        default:
          this.modX = 0;
          this.modY = Config.physics.gravity;
          break;
        case BoostDirection.Left:
        case BoostDirection.Up:
        case BoostDirection.Right:
        case BoostDirection.Down:
          this.modX = 0;
          this.modY = 0;
          break;
      }
    }

    let movementX = 0,
      movementY = 0;

    if (this.modY) {
      movementX = this.horizontal;
      movementY = 0;
    } else if (this.modX) {
      movementX = 0;
      movementY = this.vertical;
    } else {
      movementX = this.horizontal;
      movementY = this.vertical;
    }
    movementX *= this.speedMult;
    movementY *= this.speedMult;
    this.modX *= this.gravityMult;
    this.modY *= this.gravityMult;

    modifierX = (this.modX + movementX) / Config.physics.variable_multiplyer;
    modifierY = (this.modY + movementY) / Config.physics.variable_multiplyer;

    if (this.speedX || modifierX) {
      this.speedX += modifierX;

      this.speedX *= Config.physics.base_drag;
      if ((!movementX && this.modY) || (this.speedX < 0 && movementX > 0) || (this.speedX > 0 && movementX < 0)) {
        this.speedX *= Config.physics.no_modifier_drag;
      }

      if (this.speedX > 16) {
        this.speedX = 16;
      } else if (this.speedX < -16) {
        this.speedX = -16;
      } else if (Math.abs(this.speedX) < 0.0001) {
        this.speedX = 0;
      }
    }

    if (this.speedY || modifierY) {
      this.speedY += modifierY;

      this.speedY *= Config.physics.base_drag;
      if ((!movementY && this.modX) || (this.speedY < 0 && movementY > 0) || (this.speedY > 0 && movementY < 0)) {
        this.speedY *= Config.physics.no_modifier_drag;
      }

      if (this.speedY > 16) {
        this.speedY = 16;
      } else if (this.speedY < -16) {
        this.speedY = -16;
      } else if (Math.abs(this.speedY) < 0.0001) {
        this.speedY = 0;
      }
    }

    if (!isFlying) {
      switch (this.findBoostDirection(blockX, blockY, game)) {
        case BoostDirection.Left:
          this.speedX = -Config.physics.boost;
          break;
        case BoostDirection.Right:
          this.speedX = Config.physics.boost;
          break;
        case BoostDirection.Up:
          this.speedY = -Config.physics.boost;
          break;
        case BoostDirection.Down:
          this.speedY = Config.physics.boost;
          break;
      }

      const isDead = false;
      if (isDead) {
        this.speedX = 0;
        this.speedY = 0;
      }
    }

    let remainderX = this.x % 1,
      remainderY = this.y % 1;
    let currentSX = this.speedX,
      currentSY = this.speedY;
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
          this.x += 1 - remainderX;
          this.x >>= 0;
          currentSX -= 1 - remainderX;
          remainderX = 0;
        } else {
          this.x += currentSX;
          currentSX = 0;
        }
      } else if (currentSX < 0) {
        if (remainderX + currentSX < 0 && (remainderX != 0 || isBoost(current))) {
          currentSX += remainderX;
          this.x -= remainderX;
          this.x >>= 0;
          remainderX = 1;
        } else {
          this.x += currentSX;
          currentSX = 0;
        }
      }
      if (this.playerIsInFourSurroundingBlocks(game)) {
        // if(this.playstate.world != null){
        // if(this.playstate.world.overlaps(this)){
        this.x = oldX;
        if (this.speedX > 0 && this.origModX > 0) grounded = true;
        if (this.speedX < 0 && this.origModX < 0) grounded = true;

        this.speedX = 0;
        currentSX = oldSX;
        doneX = true;
      }
    };
    const stepY = () => {
      if (currentSY > 0) {
        if (currentSY + remainderY >= 1) {
          this.y += 1 - remainderY;
          this.y >>= 0;
          currentSY -= 1 - remainderY;
          remainderY = 0;
        } else {
          this.y += currentSY;
          currentSY = 0;
        }
      } else if (currentSY < 0) {
        if (remainderY + currentSY < 0 && (remainderY != 0 || isBoost(current))) {
          currentSY += remainderY;
          this.y -= remainderY;
          this.y >>= 0;
          remainderY = 1;
        } else {
          this.y += currentSY;
          currentSY = 0;
        }
      }
      if (this.playerIsInFourSurroundingBlocks(game)) {
        // if(this.playstate.world != null){
        // if(this.playstate.world.overlaps(this)){
        this.y = oldY;
        if (this.speedY > 0 && this.origModY > 0) grounded = true;
        if (this.speedY < 0 && this.origModY < 0) grounded = true;

        this.speedY = 0;
        currentSY = oldSY;
        doneY = true;
      }
    };

    while ((currentSX && !doneX) || (currentSY && !doneY)) {
      oldX = this.x;
      oldY = this.y;

      oldSX = currentSX;
      oldSY = currentSY;

      stepX();
      stepY();
    }

    // jumping
    let mod = 1;
    let inJump = false;
    if (this.isSpaceJustPressed) {
      this.lastJump = -this.ticks;
      inJump = true;
      mod = -1;
    }

    if (this.isSpaceDown) {
      if (this.lastJump < 0) {
        if (this.ticks + this.lastJump > 75) {
          inJump = true;
        }
      } else {
        if (this.ticks - this.lastJump > 15) {
          inJump = true;
        }
      }
    }

    if (((this.speedX == 0 && this.origModX && this.modX) || (this.speedY == 0 && this.origModY && this.modY)) && grounded) {
      // On ground so reset jumps to 0
      this.jumpCount = 0;
    }

    if (this.jumpCount == 0 && !grounded) this.jumpCount = 1; // Not on ground so first 'jump' removed

    if (inJump) {
      if (this.jumpCount < this.maxJumps && this.origModX && this.modX) {
        // Jump in x direction
        if (this.maxJumps < 1000) {
          // Not infinite jumps
          this.jumpCount += 1;
        }
        this.speedX = (-this.origModX * Config.physics.jump_height * this.jumpMult) / Config.physics.variable_multiplyer;
        this.lastJump = this.ticks * mod;
      }
      if (this.jumpCount < this.maxJumps && this.origModY && this.modY) {
        // Jump in y direction
        if (this.maxJumps < 1000) {
          // Not infinite jumps
          this.jumpCount += 1;
        }
        this.speedY = (-this.origModY * Config.physics.jump_height * this.jumpMult) / Config.physics.variable_multiplyer;
        this.lastJump = this.ticks * mod;
      }
    }

    if (!isFlying) {
      this.hoveringOver(game, this.center.x, this.center.y);
    }
    // sendMovement(cx, cy);

    // autoalign
    const imx = (this.speedX * 256) >> 0;
    const imy = (this.speedY * 256) >> 0;

    if (imx != 0) {
      this.moving = true;
    } else if (Math.abs(modifierX) < 0.1) {
      const tx = this.x % Config.blockSize;
      if (tx < Config.physics.autoalign_range) {
        if (tx < Config.physics.autoalign_snap_range) {
          this.x >>= 0;
        } else this.x -= tx / (Config.blockSize - 1);
      } else if (tx > Config.blockSize - Config.physics.autoalign_range) {
        if (tx > Config.blockSize - Config.physics.autoalign_snap_range) {
          this.x >>= 0;
          this.x++;
        } else this.x += (tx - (Config.blockSize - Config.physics.autoalign_range)) / (Config.blockSize - 1);
      }
    }

    if (imy != 0) {
      this.moving = true;
    } else if (Math.abs(modifierY) < 0.1) {
      const ty = this.y % Config.blockSize;
      if (ty < Config.physics.autoalign_range) {
        if (ty < Config.physics.autoalign_snap_range) {
          this.y >>= 0;
        } else this.y -= ty / (Config.blockSize - 1);
      } else if (ty > Config.blockSize - Config.physics.autoalign_range) {
        if (ty > Config.blockSize - Config.physics.autoalign_snap_range) {
          this.y >>= 0;
          this.y++;
        } else this.y += (ty - (Config.blockSize - Config.physics.autoalign_range)) / (Config.blockSize - 1);
      }
    }

    this.ticks++;
  }

  findGravityDirection(worldX: number, worldY: number, game: Game) {
    // const worldX = Math.floor(this.center.x / 32);
    // const worldY = Math.floor(this.center.y / 32);

    return (
      this.findBoostDirection(worldX, worldY, game) ||
      this.findZoostDirection(worldX, worldY, game) ||
      this.findArrowDirection(worldX, worldY, game) ||
      ArrowDirection.Down
    );
  }

  findArrowDirection(blockX: number, blockY: number, game: Game) {
    const actionBlock = game.world.blockAt(blockX, blockY, TileLayer.Action);

    return actionBlock === game.tileJson.id("arrow-up")
      ? ArrowDirection.Up
      : actionBlock === game.tileJson.id("arrow-right")
      ? ArrowDirection.Right
      : actionBlock === game.tileJson.id("arrow-down")
      ? ArrowDirection.Down
      : actionBlock === game.tileJson.id("arrow-left")
      ? ArrowDirection.Left
      : undefined;
  }

  findBoostDirection(blockX: number, blockY: number, game: Game) {
    const actionBlock = game.world.blockAt(blockX, blockY, TileLayer.Action);

    return actionBlock === game.tileJson.id("boost-up")
      ? BoostDirection.Up
      : actionBlock === game.tileJson.id("boost-right")
      ? BoostDirection.Right
      : actionBlock === game.tileJson.id("boost-down")
      ? BoostDirection.Down
      : actionBlock === game.tileJson.id("boost-left")
      ? BoostDirection.Left
      : undefined;
  }

  findZoostDirection(blockX: number, blockY: number, game: Game) {
    const actionBlock = game.world.blockAt(blockX, blockY, TileLayer.Action);

    return actionBlock === game.tileJson.id("zoost-up")
      ? ZoostDirection.Up
      : actionBlock === game.tileJson.id("zoost-right")
      ? ZoostDirection.Right
      : actionBlock === game.tileJson.id("zoost-down")
      ? ZoostDirection.Down
      : actionBlock === game.tileJson.id("zoost-left")
      ? ZoostDirection.Left
      : undefined;
  }

  capIntoWorldBoundaries(game: Game) {
    const previousX = this.position.x;
    const previousY = this.position.y;

    const PLAYER_WIDTH = 32;
    const PLAYER_HEIGHT = 32;

    this.position.x = clamp(this.position.x, 0, (game.world.size.width - 1) * PLAYER_WIDTH);
    this.position.y = clamp(this.position.y, 0, (game.world.size.height - 1) * PLAYER_HEIGHT);

    if (previousX !== this.position.x) this.velocity.x = 0;
    if (previousY !== this.position.y) this.velocity.y = 0;
  }

  cleanup() {
    // this method is relied upon and expected to be called
  }

  playerIsInFourSurroundingBlocks(game: Game): boolean {
    function rectInRect(px: number, py: number, tx: number, ty: number) {
      // lol, im lazy
      tx *= 32;
      ty *= 32;

      // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
      return px < tx + 32 && px + 32 > tx && py < ty + 32 && py + 32 > ty;
    }

    const worldX = Math.floor(this.position.x / 32);
    const worldY = Math.floor(this.position.y / 32);

    const maxX = game.world.size.width;
    const maxY = game.world.size.height;
    const inBounds = (x: number, y: number) => x >= 0 && x < maxX && y >= 0 && y < maxY;

    const has = (x: number, y: number) => (inBounds(x, y) ? !this.noCollision(game, game.world.blockAt(x, y, TileLayer.Foreground)) : true);
    const has00 = has(worldX, worldY);
    const has10 = has(worldX + 1, worldY);
    const has01 = has(worldX, worldY + 1);
    const has11 = has(worldX + 1, worldY + 1);

    return (
      (has00 && rectInRect(this.position.x, this.position.y, worldX, worldY)) ||
      (has10 && rectInRect(this.position.x, this.position.y, worldX + 1, worldY)) ||
      (has01 && rectInRect(this.position.x, this.position.y, worldX, worldY + 1)) ||
      (has11 && rectInRect(this.position.x, this.position.y, worldX + 1, worldY + 1))
    );
  }

  // TODO: this should be somewhere else lol
  noCollision(game: Game, blockId: number): boolean {
    const [isInsideKeyBlock, redKeyTouchedState] = this.insideKeyBlock;

    let redKeyTouched = game.world.redKeyTouched;
    if (isInsideKeyBlock) {
      redKeyTouched = redKeyTouchedState;
    }

    // TODO: there's got to be a better way to switch the solid-ness of a gate/door
    const keySolid = redKeyTouched ? "keys-red-door" : "keys-red-gate";
    return blockId === 0 || blockId === game.tileJson.id("keys-red-key") || blockId === game.tileJson.id(keySolid);
  }

  insideRedKey = false;
  insideKeyBlock = [false, false];

  hoveringOver(game: Game, inX: number, inY: number) {
    const x = Math.floor(inX / Config.blockSize);
    const y = Math.floor(inY / Config.blockSize);

    const maxX = game.world.size.width;
    const maxY = game.world.size.height;
    const inBounds = (x: number, y: number) => x >= 0 && x < maxX && y >= 0 && y < maxY;

    if (!inBounds(x, y)) {
      this.insideRedKey = false;
      return;
    }

    const foregroundBlock = game.world.blockAt(x, y, TileLayer.Foreground);

    if (game.tileJson.id("keys-red-key") === foregroundBlock) {
      if (!this.insideRedKey) {
        this.touchRedKey(game);
      }

      this.insideRedKey = true;
    } else {
      this.insideRedKey = false;
    }

    const checkInsideKey = (x: number, y: number) => {
      x = Math.floor(x / Config.blockSize);
      y = Math.floor(y / Config.blockSize);
      if (!inBounds(x, y)) return false;

      const actionBlock = game.world.blockAt(x, y, TileLayer.Action);

      if (game.tileJson.id("keys-red-door") === actionBlock || game.tileJson.id("keys-red-gate") === actionBlock) {
        const [prevInsideKeyBlock, _] = this.insideKeyBlock;

        if (!prevInsideKeyBlock) {
          this.insideKeyBlock = [true, game.world.redKeyTouched];
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
      this.insideKeyBlock = [false, false];
    }
  }

  touchRedKey(game: Game) {
    game.world.touchRedKey(this);
  }
}
