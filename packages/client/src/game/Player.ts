import { TileLayer } from "@smiley-face-game/api/types";
import Position from "./interfaces/Position";
import Velocity from "./interfaces/Velocity";
import Inputs from "./interfaces/Inputs";
import PhysicsObject from "./interfaces/PhysicsObject";
import defaultInputs from "./helpers/defaultInputs";
import Game from "./Game";
import { PHYSICS_DECELERATION_DRAG, position_after, velocity_after } from "./physics/path";
import clamp from "./helpers/clamp";

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
  gunAngle: number = 0;
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

  constructor(readonly id: number, readonly username: string, readonly isGuest: boolean) { }

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
  
  private deltaAccum: number = 0;
  tick(game: Game, deltaMs: number) {
    // 100 ticks per second
    // 10 ticks per 100ms
    // 1 tick per 10ms
    this.deltaAccum += deltaMs;

    while (this.deltaAccum >= 10) {
      this.deltaAccum -= 10;
      this.eetick(game, 0);
    }
  }

  private horizontal: number = 0;
  private vertical: number = 0;
  private isSpaceDown: boolean = false;
  private isSpaceJustPressed: boolean = false;
  private speedMult: number = 1;
  private gravityMult: number = 1;
  private speedX: number = 0;
  private speedY: number = 0;
  private get x(): number { return this.position.x / 2 };
  private set x(x: number) { this.position.x = x * 2 };
  private get y(): number { return this.position.y / 2 };
  private set y(y: number) { this.position.y = y * 2 };
  private ticks: number = 0;
  private lastJump: number = 0;
  private jumpCount: number = 0;
  private maxJumps: number = 1;
  private jumpMult: number = 1;
  private moving: boolean = false;
  private queue: number[] = [ArrowDirection.Down];
  private origModX: number = 0;
  private origModY: number = 0;
  private modX: number = 0;
  private modY: number = 0;
  eetick(game: Game, deltaMs: number) {

    this.horizontal = (this.input.right && 1 || 0) - (this.input.left && 1 || 0);
    this.vertical = (this.input.down && 1 || 0) - (this.input.up && 1 || 0);
    this.isSpaceJustPressed = !this.isSpaceDown && this.input.jump;
    this.isSpaceDown = this.input.jump;

    let blockX = Math.round(this.x/Config.blockSize);
    let blockY = Math.round(this.y/Config.blockSize);

    let delayed = this.queue.shift()!;
    let current = this.findGravityDirection(blockX, blockY, game);
    this.queue.push(current);

    let modifierX = 0, modifierY = 0;

    // let isFlying = this.isInGodMode;
    let isFlying = false;
    if(!isFlying) {
      this.origModX = this.modX;
      this.origModY = this.modY;

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
      }
    }

    let movementX = 0, movementY = 0;

    if(this.modY) {
      movementX = this.horizontal;
      movementY = 0;
    }
    else if(this.modX) {
      movementX = 0;
      movementY = this.vertical;
    }
    else {
      movementX = this.horizontal;
      movementY = this.vertical;
    }
    movementX *= this.speedMult;
    movementY *= this.speedMult;
    this.modX *= this.gravityMult;
    this.modY *= this.gravityMult;

    modifierX = (this.modX + movementX) / Config.physics.variable_multiplyer;
    modifierY = (this.modY + movementY) / Config.physics.variable_multiplyer;

    if(this.speedX || modifierX) {
      this.speedX += modifierX;

      this.speedX *= Config.physics.base_drag;
      if((!movementX && this.modY) || (this.speedX < 0 && movementX > 0) || (this.speedX > 0 && movementX < 0)) {
        this.speedX *= Config.physics.no_modifier_drag;
      }

      if(this.speedX > 16) {
        this.speedX = 16;
      } else if(this.speedX < -16) {
        this.speedX = -16;
      } else if(Math.abs(this.speedX) < 0.0001) {
        this.speedX = 0;
      }
    }

    if(this.speedY || modifierY) {
      this.speedY += modifierY;

      this.speedY *= Config.physics.base_drag;
      if((!movementY && this.modX) || (this.speedY < 0 && movementY > 0) || (this.speedY > 0 && movementY < 0)) {
        this.speedY *= Config.physics.no_modifier_drag;
      }

      if(this.speedY > 16) {
        this.speedY = 16;
      } else if(this.speedY < -16) {
        this.speedY = -16;
      } else if(Math.abs(this.speedY) < 0.0001) {
        this.speedY = 0;
      }
    }

    let remainderX = this.x % 1, remainderY = this.y % 1;
    let currentSX = this.speedX, currentSY = this.speedY;
    let oldSX = 0, oldSY = 0;
    let oldX = 0, oldY = 0;

    let doneX = false, doneY = false;

    let grounded = false;

    let stepX = () => {
      if(currentSX > 0){
        if(currentSX + remainderX >= 1){
          this.x += (1-remainderX);
          this.x >>= 0;
          currentSX -= (1-remainderX);
          remainderX = 0;
        } else {
          this.x += currentSX;
          currentSX = 0;
        }
      }
      else if(currentSX < 0){
        if(remainderX + currentSX < 0 && (remainderX != 0)){
          currentSX += remainderX;
          this.x -= remainderX;
          this.x >>= 0;
          remainderX = 1;
        }else{
          this.x += currentSX;
          currentSX = 0;
        }
      }
      if (true) {
        if (this.playerIsInFourSurroundingBlocks(game)) {
      // if(this.playstate.world != null){
        // if(this.playstate.world.overlaps(this)){
          this.x = oldX;
          if (this.speedX > 0 && (this.origModX > 0))
            grounded = true;
          if (this.speedX < 0 && (this.origModX < 0))
            grounded = true;

          this.speedX = 0;
          currentSX = oldSX;
          doneX = true;
        }
      }
    }
    let stepY = () => {
      if(currentSY > 0){
        if(currentSY + remainderY >= 1){
          this.y += (1-remainderY);
          this.y >>= 0;
          currentSY -= (1-remainderY);
          remainderY = 0;
        } else {
          this.y += currentSY;
          currentSY = 0;
        }
      }
      else if(currentSY < 0){
        if(remainderY + currentSY < 0 && (remainderY != 0)){
          currentSY += remainderY;
          this.y -= remainderY;
          this.y >>= 0;
          remainderY = 1;
        }else{
          this.y += currentSY;
          currentSY = 0;
        }
      }
      if (true) {
      if (this.playerIsInFourSurroundingBlocks(game)) {
      // if(this.playstate.world != null){
        // if(this.playstate.world.overlaps(this)){
          this.y = oldY;
          if (this.speedY > 0 && (this.origModY > 0))
            grounded = true;
          if (this.speedY < 0 && (this.origModY < 0))
            grounded = true;

          this.speedY = 0;
          currentSY = oldSY;
          doneY = true;
        }
      }
    }

    while((currentSX && !doneX) || (currentSY && !doneY)) {
      oldX = this.x;
      oldY = this.y;

      oldSX = currentSX;
      oldSY = currentSY;

      stepX();
      stepY();
    }



    // jumping
    let mod = 1
    let inJump = false;
    if (this.isSpaceJustPressed){
      this.lastJump = -this.ticks;
      inJump = true;
      mod = -1
    }

    if(this.isSpaceDown){
        if(this.lastJump < 0){
          if(this.ticks + this.lastJump > 75){
            inJump = true;
          }
        }else{
          if(this.ticks - this.lastJump > 15){
            inJump = true;
          }
        }
    }

    if((this.speedX == 0 && this.origModX && this.modX || this.speedY == 0 && this.origModY && this.modY) && grounded) {
      // On ground so reset jumps to 0
      this.jumpCount = 0;
    }

    if(this.jumpCount == 0 && !grounded) this.jumpCount = 1; // Not on ground so first 'jump' removed

    if(inJump) {
      if(this.jumpCount < this.maxJumps && this.origModX && this.modX) { // Jump in x direction
        if (this.maxJumps < 1000) { // Not infinite jumps
          this.jumpCount += 1;
        }
        this.speedX = (-this.origModX * Config.physics.jump_height * this.jumpMult) / Config.physics.variable_multiplyer;
        this.lastJump = this.ticks * mod;
      }
      if(this.jumpCount < this.maxJumps && this.origModY && this.modY) { // Jump in y direction
        if (this.maxJumps < 1000) { // Not infinite jumps
          this.jumpCount += 1;
        }
        this.speedY = (-this.origModY * Config.physics.jump_height * this.jumpMult) / Config.physics.variable_multiplyer;
        this.lastJump = this.ticks * mod;
      }
    }

    // touchBlock(cx, cy, isgodmod);
    // sendMovement(cx, cy);



    // autoalign
    let imx = (this.speedX*256)>>0;
    let imy = (this.speedY*256)>>0;

    if(imx != 0) {
      this.moving = true;
    }
    else if(Math.abs(modifierX) < 0.1) {
      let tx = this.x % Config.blockSize;
      if(tx < Config.physics.autoalign_range) {
        if(tx < Config.physics.autoalign_snap_range) {
          this.x >>= 0;
        }
        else this.x -= tx/(Config.blockSize-1);
      }
      else if(tx > Config.blockSize - Config.physics.autoalign_range) {
        if(tx > Config.blockSize - Config.physics.autoalign_snap_range) {
          this.x >>= 0;
          this.x++;
        }
        else this.x += (tx-(Config.blockSize - Config.physics.autoalign_range))/(Config.blockSize-1);
      }
    }

    if(imy != 0) {
      this.moving = true;
    }
    else if(Math.abs(modifierY) < 0.1) {
      let ty = this.y % Config.blockSize;
      if(ty < Config.physics.autoalign_range) {
        if(ty < Config.physics.autoalign_snap_range) {
          this.y >>= 0;
        }
        else this.y -= ty/(Config.blockSize-1);
      }
      else if(ty > Config.blockSize - Config.physics.autoalign_range) {
        if(ty > Config.blockSize - Config.physics.autoalign_snap_range) {
          this.y >>= 0;
          this.y++;
        }
        else this.y += (ty-(Config.blockSize - Config.physics.autoalign_range))/(Config.blockSize-1);
      }
    }

    this.ticks++;

  }

  findGravityDirection(worldX: number, worldY: number, game: Game) {
    // const worldX = Math.floor(this.center.x / 32);
    // const worldY = Math.floor(this.center.y / 32);
    const actionBlock = game.world.blockAt(worldX, worldY, TileLayer.Action);

    return actionBlock === game.tileJson.id("arrow-up")
      ? ArrowDirection.Up
      : actionBlock === game.tileJson.id("arrow-right")
        ? ArrowDirection.Right
        : actionBlock === game.tileJson.id("arrow-down")
          ? ArrowDirection.Down
          : actionBlock === game.tileJson.id("arrow-left")
            ? ArrowDirection.Left
            : ArrowDirection.Down;
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

  cleanup() { }

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

    const has00 = game.world.blockAt(worldX, worldY, TileLayer.Foreground) !== 0;
    const has10 = game.world.blockAt(worldX + 1, worldY, TileLayer.Foreground) !== 0;
    const has01 = game.world.blockAt(worldX, worldY + 1, TileLayer.Foreground) !== 0;
    const has11 = game.world.blockAt(worldX + 1, worldY + 1, TileLayer.Foreground) !== 0;
    console.log(has00,has10,has01,has11);

    return (has00 && rectInRect(this.position.x, this.position.y, worldX, worldY))
      || (has10 && rectInRect(this.position.x, this.position.y, worldX + 1, worldY))
      || (has01 && rectInRect(this.position.x, this.position.y, worldX, worldY + 1))
      || (has11 && rectInRect(this.position.x, this.position.y, worldX + 1, worldY + 1))
  }
}

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
  static gameWidthCeil = Config.blockSize*Math.ceil(Config.gameWidth/Config.blockSize);
  static gameHeightCeil = Config.blockSize*Math.ceil(Config.gameHeight/Config.blockSize);

  static camera_lag = 1/16;

  static physics = {
    ms_per_tick: 10,
    max_ticks_per_frame: 150,
    variable_multiplyer: 7.752,

    base_drag: Math.pow(.9981, 10) * 1.00016093,
    ice_no_mod_drag: Math.pow(.9993, 10) * 1.00016093,
    ice_drag: Math.pow(.9998, 10) * 1.00016093,
    //Multiplyer when not applying force by userkeys
    no_modifier_drag: Math.pow(.9900, 10) * 1.00016093,
    water_drag: Math.pow(.9950, 10) * 1.00016093,
    mud_drag: Math.pow(.9750, 10) * 1.00016093,
    lava_drag: Math.pow(.9800, 10) * 1.00016093,
    toxic_drag: Math.pow(.9900, 10) * 1.00016093,
    jump_height: 26,

    autoalign_range: 2,
    autoalign_snap_range: 0.2,

    gravity: 2,
    boost: 16,
    water_buoyancy: -.5,
    mud_buoyancy: .4,
    lava_buoyancy: .2,
    toxic_buoyancy: -.4,
  }
}
Object.freeze(Config.physics);
Object.freeze(Config);