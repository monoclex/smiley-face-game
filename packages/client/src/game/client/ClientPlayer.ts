import { Container, Sprite } from "pixi.js";
import Game from "../Game";
import Player from "../Player";
import textures from "../textures";
import Position from "../interfaces/Position";
import distanceAway from "../../math/distanceAway";

export default class ClientPlayer extends Player {
  container: Container;
  cosmetic: Sprite;
  sprite: Sprite;
  gun: Sprite;

  /** the 'probably has gun' thing is used to not send duplicate network packets */
  probablyPickedUpGunAt: Position | undefined;
  get probablyHasGun(): boolean {
    return this.hasGun || !!this.probablyPickedUpGunAt;
  }

  get pendingGunPickup(): boolean {
    return !this.hasGun && !!this.probablyPickedUpGunAt;
  }

  constructor(id: number, username: string, isGuest: boolean) {
    super(id, username, isGuest);
    this.container = new Container();
    this.cosmetic = new Sprite(textures.get("smile"));
    this.sprite = new Sprite(textures.get("player"));
    this.gun = new Sprite(textures.get("gun"));
    this.gun.visible = false;

    this.container.addChild(this.sprite, this.cosmetic, this.gun);
  }

  holdGun(isHeld: boolean) {
    super.holdGun(isHeld);
  }

  tick(game: Game, deltaMs: number) {
    super.tick(game, deltaMs);
    this.container.position.x = this.position.x;
    this.container.position.y = this.position.y;

    // https://github.com/SirJosh3917/smiley-face-game/blob/d8cfff2df26ee29aa569c40b5bddc73ae84a3b7b/packages/client/src/game/guns/behaviour/GunBehaviour.ts#L18-L61
    if (!this.hasGun) return;
    this.gun.visible = true;

    if (!this.isGunHeld) {
      // place it behind the player and rotate it so it looks like it's carried on the player's back diagonally-ish
      this.gun.position.x = 0 + 16 - 6;
      this.gun.position.y = 0 + 16 - 6;
      this.gun.rotation = Math.PI / 3.5;
      this.gun.scale.y = 1; // setFlipX(false)
      return;
    }

    // gun is equipped, have it go around the player

    // given the angle the user is holding it at, place the gun 20 units away from the player
    const { x, y } = distanceAway({ x: 16, y: 16 }, this.gunAngle, 20);

    // TODO: align the gun exactly with the cursor
    this.gun.position.x = x;
    this.gun.position.y = y;

    // MATH TIME:
    // 'angle' will be approximately the following:

    //  -PI / 2
    //    ____
    //   /    \
    // P|      | 0
    // I|      |
    //   \____/
    //   PI / 2

    // if |angle| > (pi / 2), we'll flip the x axis and subtract pi to get the right rotation for the flipped gun

    this.gun.rotation = this.gunAngle;
    this.gun.scale.y = Math.abs(this.gunAngle) > Math.PI / 2 ? -1 : 1;
  }

  setProbablyGunPickupLocation(at: Position | undefined) {
    this.probablyPickedUpGunAt = at;
  }

  cleanup() {
    this.container.destroy({ children: true });
  }
}
