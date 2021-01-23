import { TileLayer } from "@smiley-face-game/api/types";
import Position from "../interfaces/Position";
import Velocity from "../interfaces/Velocity";
import Inputs from "../interfaces/Inputs";
import PhysicsObject from "../interfaces/PhysicsObject";
import defaultInputs from "../helpers/defaultInputs";
import Game from "../Game";
import { PHYSICS_DECELERATION_DRAG, position_after, velocity_after } from "../physics/path";
import clamp from "../helpers/clamp";

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
  gravityDirection: number = ArrowDirection.Down;
  position: Position = { x: 0, y: 0 };
  velocity: Velocity = { x: 0, y: 0 };
  input: Inputs = defaultInputs();
  private _role: "non" | "edit" | "staff" | "owner" = "non"; // TODO: remove role in favor of permission based stuff
  gunAngle: number = 0;
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

  tick(game: Game, deltaMs: number) {
    // ===
    // BIG TODO: abstract gravity stuff into its own code thing so that way
    // we can read/write code that pretends like down is gravity
    // whilst it's actually direction agnostic in practice
    // ===

    const gravityDirection = this.findGravityDirection(game);
    this.gravityDirection = gravityDirection;

    // calculate the direction to go in based on what's pressed
    let directionX = 0;
    let directionY = 2;
    // if (this.input.up) directionY--;
    // if (this.input.down) directionY++;
    if (gravityDirection === ArrowDirection.Up || gravityDirection === ArrowDirection.Down) {
      if (this.input.left) directionX--;
      if (this.input.right) directionX++;
    } else if (gravityDirection === ArrowDirection.Left) {
      if (this.input.up) directionX--;
      if (this.input.down) directionX++;
    } else if (gravityDirection === ArrowDirection.Right) {
      if (this.input.up) directionX--;
      if (this.input.down) directionX++;
    }

    // if the player doesn't press any keys, they loose acceleration a lot faster
    let dragX = directionX === 0 ? PHYSICS_DECELERATION_DRAG : undefined;
    let dragY = undefined;

    // TODO: somehow bake these into gravity stuff so that way we can write code that is
    // direction-agnostic and easily understandable
    if (gravityDirection === ArrowDirection.Up) directionY *= -1;
    else if (gravityDirection === ArrowDirection.Right) {
      let tmp = directionX;
      directionX = directionY;
      directionY = tmp;
      dragY = dragX;
      dragX = undefined;
    } else if (gravityDirection === ArrowDirection.Left) {
      let tmp = directionX;
      directionX = -directionY;
      directionY = tmp;
      dragY = dragX;
      dragX = undefined;
    }

    let x = this.position.x;
    let velX = this.velocity.x;
    this.position.x = position_after(deltaMs, x, velX, directionX, dragX);
    this.velocity.x = velocity_after(deltaMs, x, velX, directionX, dragX);

    let y = this.position.y;
    let velY = this.velocity.y;
    this.position.y = position_after(deltaMs, y, velY, directionY, dragY);
    this.velocity.y = velocity_after(deltaMs, y, velY, directionY, dragY);

    {
      // ========== AWFUL PHYSICS HANDLING START ============================================================================================
      // TODO: better physics handling
      // for now, we just go "eh, ill go across the player's line a bunch and if i run into something i'll run back a bit yeh?"
      // accuracy needs to result in a '1' for xAdv/yAdv and less than '1' for the other (yAdv/xAdv)
      let farX = this.position.x < x ? Math.floor(this.position.x) : Math.ceil(this.position.x);
      let nearX = x < this.position.x ? Math.floor(x) : Math.ceil(x);
      let farY = this.position.y < y ? Math.floor(this.position.y) : Math.ceil(this.position.y);
      let nearY = y < this.position.y ? Math.floor(y) : Math.ceil(y);
      const ACCURACY_AMT = Math.max(Math.abs(farX - nearX), Math.abs(farY - nearY));
      let xAdv = (this.position.x - x) / ACCURACY_AMT;
      let yAdv = (this.position.y - y) / ACCURACY_AMT;
      let simX = x;
      let simY = y;
      let doSetZeroX = false;
      let doSetZeroY = false;
      const epsilon = Math.min(xAdv, yAdv) / 1.1;
      for (let _ = 0; _ < ACCURACY_AMT; _++) {
        let prevSimX = simX;
        let prevSimY = simY;
        simX += xAdv;
        simY += yAdv;

        if (simX < Math.floor(simX) + epsilon) simX = Math.floor(simX);
        if (simX > Math.ceil(simX) - epsilon) simX = Math.ceil(simX);
        if (simY < Math.floor(simY) + epsilon) simY = Math.floor(simY);
        if (simY > Math.ceil(simY) - epsilon) simY = Math.ceil(simY);

        // TODO: don't duplicate code
        // cap the player inside world bounds
        const PLAYER_WIDTH = 32;
        const PLAYER_HEIGHT = 32;
        simX = clamp(simX, 0, (game.world.size.width - 1) * PLAYER_WIDTH);
        simY = clamp(simY, 0, (game.world.size.height - 1) * PLAYER_HEIGHT);

        const worldX = Math.floor(simX / 32);
        const worldY = Math.floor(simY / 32);

        // < - the bit that checks if a player enters a block - >
        if (this.onEnterGun && game.world.blockAt(worldX, worldY, TileLayer.Action) === game.tileJson.id("gun")) {
          this.onEnterGun(worldX, worldY);
        }
        // < -- >

        // instead of naively iterating through all 4 blocks around the player,
        // we'll iterate around them in order of nearest (fixes some collision bugs)
        const boxOffsets = [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ];
        const boxWorldCoordsCenters = boxOffsets.map(([ox, oy]) => [
          worldX * 32 + ox * 32,
          worldY * 32 + oy * 32,
          worldX + ox,
          worldY + oy,
        ]);
        const boxByDist = boxWorldCoordsCenters
          .map(([x, y, wx, wy]) => [dist(simX, simY, x, y), wx, wy])
          .sort(([a], [b]) => a - b);
        /** for performance (yes i know """performance""" in this god awful code is cringe) we just dont do the math sqrt */
        function dist(sourceX: number, sourceY: number, destX: number, destY: number): number {
          // sqrt((x2 - x1)^2 + (y2 - y1)^2)
          // dont do the sqrt since we dont care about distance, just how far something is
          let left = sourceX - destX;
          let right = sourceY - destY;
          return left * left + right * right;
        }

        for (const [_, boxX, boxY] of boxByDist) {
          if (boxX < 0 || boxY < 0 || boxX >= game.world.size.width || boxY >= game.world.size.height) continue;
          const isSolid = game.world.blockAt(boxX, boxY, TileLayer.Foreground) !== 0;
          if (!isSolid) continue;
          if (rectInRect(simX, simY, boxX * 32, boxY * 32)) {
            // in collision (we probably weren't before)
            // try to resolve both ways
            if (!rectInRect(prevSimX, simY, boxX * 32, boxY * 32)) {
              // instead of backing up the simulation by a simulation tick, we round it to the nearest 32x32 whole number
              // so that we can fit through gaps and stuff
              let diff = simX - prevSimX;
              if (diff < 0) {
                simX = boxX * 32 + 32;
              } /* diff > 0 */ else {
                simX = boxX * 32 - 32;
              }
              doSetZeroX = true;
            } else if (!rectInRect(simX, prevSimY, boxX * 32, boxY * 32)) {
              let diff = simY - prevSimY;
              if (diff < 0) {
                simY = boxY * 32 + 32;
              } else {
                simY = boxY * 32 - 32;
              }
              doSetZeroY = true;
            } else {
              // so we couldn't fix our collision by moving back a tick in the x/y direction
              // we could either be in a 4x4 amount of blocks or just dealing with weird floating point errors
              // we will attempt to resovle this by affixing our position to one of the nearest blocks
              const b2oxOffsets = [
                [0, 0],
                [1, 0],
                [0, 1],
                [1, 1],
              ];
              const b2oxWorldCoordsCenters = b2oxOffsets.map(([ox, oy]) => [
                worldX * 32 + ox * 32 + 16,
                worldY * 32 + oy * 32 + 16,
                worldX + ox,
                worldY + oy,
              ]);
              const b2oxByDist = b2oxWorldCoordsCenters
                .map(([x, y, wx, wy]) => [dist(simX + 16, simY + 16, x, y), wx, wy])
                .sort(([a], [b]) => a - b);
              for (const [_, bx, by] of b2oxByDist) {
                if (bx < 0 || by < 0 || bx >= game.world.size.width || by >= game.world.size.height) continue;
                const isSolid = game.world.blockAt(bx, by, TileLayer.Foreground) !== 0;
                if (isSolid) continue;
                simX = bx * 32;
                simY = by * 32;
                break;
              }
            }
          }
        }
      }

      if (doSetZeroX) {
        this.position.x = simX;
        this.velocity.x = 0;
      }
      if (doSetZeroY) {
        this.position.y = simY;
        this.velocity.y = 0;
      }

      function rectInRect(px: number, py: number, tx: number, ty: number) {
        // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
        return px < tx + 32 && px + 32 > tx && py < ty + 32 && py + 32 > ty;
      }
      // ========== AWFUL PHYSICS HANDLING END ==============================================================================================
    }

    this.capIntoWorldBoundaries(game);

    // trial and error
    const JUMP_CONSTANT = -13.2;

    if (gravityDirection === ArrowDirection.Up || gravityDirection === ArrowDirection.Down) {
      // if we want to jump and we collided on the y axis (TODO: check if on ground properly)
      // TODO: is there some way to immediately apply velocity for one frame?
      if (
        this.input.jump &&
        this.velocity.y === 0 &&
        /* if they're currently not moving, and last frame they were at least moving down or standing still */
        (gravityDirection === ArrowDirection.Up ? -1 : 1) * velY >= 0
      ) {
        this.velocity.y = (gravityDirection === ArrowDirection.Up ? -1 : 1) * JUMP_CONSTANT; // velocity_after(deltaMs, y, velY, -1 * 2 - 1);
      }
    } else {
      // TODO: nuke this when gravity is done properly
      if (this.input.jump && this.velocity.x === 0 && (gravityDirection === ArrowDirection.Left ? -1 : 1) * velX >= 0) {
        this.velocity.x = (gravityDirection === ArrowDirection.Left ? -1 : 1) * JUMP_CONSTANT;
      }
    }
  }

  findGravityDirection(game: Game) {
    const worldX = Math.floor(this.center.x / 32);
    const worldY = Math.floor(this.center.y / 32);
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

  cleanup() {}
}
