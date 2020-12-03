import { TileLayer } from "@smiley-face-game/api/types";
import Position from "./Position";
import Velocity from "./Velocity";
import Inputs from "./Inputs";
import GunState from "./GunState";
import PhysicsObject from "./PhysicsObject";
import defaultInputs from "./defaultInputs";
import Game from "./Game";

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

  tick(game: Game) {
    // stupidly simple physics just so we can prototype for now
    // fancy stuff coming later <3
    this.velocity.x = 0;
    this.velocity.y = 0;
    if (this.input.up) this.velocity.y--;
    if (this.input.down) this.velocity.y++;
    if (this.input.left) this.velocity.x--;
    if (this.input.right) this.velocity.x++;

    const PLAYER_WIDTH = 32;
    const PLAYER_HEIGHT = 32;
    const HALF_PLAYER_WIDTH = PLAYER_WIDTH / 2;
    const HALF_PLAYER_HEIGHT = PLAYER_HEIGHT / 2;
    const centerX = Math.floor((this.position.x + HALF_PLAYER_WIDTH) / PLAYER_WIDTH);
    const centerY = Math.floor((this.position.y + HALF_PLAYER_HEIGHT) / PLAYER_HEIGHT);

    const block = game.world.blockAt(centerX, centerY, TileLayer.Action);

    // TODO: this better
    if (block === game.tileJson.id("arrow-up")) this.velocity.y = -2;
    if (block === game.tileJson.id("arrow-down")) this.velocity.y = 2;
    if (block === game.tileJson.id("arrow-left")) this.velocity.x = -2;
    if (block === game.tileJson.id("arrow-right")) this.velocity.x = 2;

    this.position.x += this.velocity.x * HALF_PLAYER_WIDTH;
    this.position.y += this.velocity.y * HALF_PLAYER_HEIGHT;

    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x > (game.world.size.width - 1) * PLAYER_WIDTH)
      this.position.x = (game.world.size.width - 1) * PLAYER_WIDTH;

    if (this.position.y < 0) this.position.y = 0;
    if (this.position.y > (game.world.size.height - 1) * PLAYER_HEIGHT)
      this.position.y = (game.world.size.height - 1) * PLAYER_HEIGHT;
  }

  destroy() {
    // TODO: run code that needs to be run on deletion
  }
}
