import { TileLayer } from "@smiley-face-game/api/types";
import Position from "../interfaces/Position";
import Velocity from "../interfaces/Velocity";
import Inputs from "../interfaces/Inputs";
import PhysicsObject from "../interfaces/PhysicsObject";
import defaultInputs from "../helpers/defaultInputs";
import Game from "../Game";
import accelerate from "../physics/math/acceleration";
import { PHYSICS_DECELERATION_DRAG, position_after, velocity_after } from "../physics/path";

enum GunState {
  None,
  Carrying,
  Held,
}

export default class Player implements PhysicsObject {
  position: Position = { x: 0, y: 0 };
  velocity: Velocity = { x: 0, y: 0 };
  input: Inputs = defaultInputs();
  role: "non" | "edit" | "staff" | "owner" = "non"; // TODO: remove role in favor of permission based stuff
  private gunState: GunState = 0;

  get hasGun(): boolean {
    return this.gunState >= GunState.Carrying;
  }

  get isGunHeld(): boolean {
    return this.gunState === GunState.Held;
  }

  get hasEdit(): boolean {
    return this.role === "edit" || this.role === "owner";
  }

  constructor(readonly id: number, readonly username: string, readonly isGuest: boolean) {}

  pickupGun() {
    if (this.hasGun) throw new Error("picked up gun when already have a gun");
    this.gunState = GunState.Carrying;
  }

  holdGun(isHeld: boolean) {
    if (!this.hasGun) throw new Error("can't hold gun when there is no gun");
    this.gunState = isHeld ? GunState.Held : GunState.Carrying;
  }

  tick(game: Game, deltaMs: number) {
    // stupidly simple physics just so we can prototype for now
    // fancy stuff coming later <3
    let directionX = 0;
    let directionY = 0;
    if (this.input.up) directionY--;
    if (this.input.down) directionY++;
    if (this.input.left) directionX--;
    if (this.input.right) directionX++;

    // if the player doesn't press any keys, they loose acceleration a lot faster
    let drag = directionX === 0 ? PHYSICS_DECELERATION_DRAG : undefined;
    let x = this.position.x;
    let velX = this.velocity.x;
    this.position.x = position_after(deltaMs, x, velX, directionX, drag);
    this.velocity.x = velocity_after(deltaMs, x, velX, directionX, drag);

    let y = this.position.y;
    let velY = this.velocity.y;
    this.position.y = position_after(deltaMs, y, velY, 1 * 2);
    this.velocity.y = velocity_after(deltaMs, y, velY, 1 * 2);

    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x = 0;
    }

    const PLAYER_WIDTH = 32;
    if (this.position.x > (game.world.size.width - 1) * PLAYER_WIDTH) {
      this.position.x = (game.world.size.width - 1) * PLAYER_WIDTH;
      this.velocity.x = 0;
    }

    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = 0;
    }

    const PLAYER_HEIGHT = 32;
    if (this.position.y > (game.world.size.height - 1) * PLAYER_HEIGHT) {
      this.position.y = (game.world.size.height - 1) * PLAYER_HEIGHT;
      this.velocity.y = 0;
    }

    // if we want to jump and we collided on the y axis (TODO: check if on ground properly)
    if (this.input.jump && this.velocity.y === 0) {
      this.velocity.y = -13.5; // velocity_after(deltaMs, y, velY, -1 * 2 - 1);
    }
  }

  destroy() {
    // TODO: run code that needs to be run on deletion
  }
}
