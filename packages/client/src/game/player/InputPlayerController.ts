import PlayerController from "./PlayerController";
import GunController from "../components/gun/GunController";
import Player from "./Player";

export default class InputPlayerController implements PlayerController, GunController {
  #up: Phaser.Input.Keyboard.Key;
  #left: Phaser.Input.Keyboard.Key;
  #right: Phaser.Input.Keyboard.Key;

  #w: Phaser.Input.Keyboard.Key;
  #a: Phaser.Input.Keyboard.Key;
  #d: Phaser.Input.Keyboard.Key;

  #jump: Phaser.Input.Keyboard.Key;

  #equip: Phaser.Input.Keyboard.Key;

  x: undefined;
  y: undefined;

  // TODO: less h a c k y
  player!: Player;

  constructor(readonly scene: Phaser.Scene) {
    const { UP, LEFT, RIGHT, W, A, D, SPACE, E } = Phaser.Input.Keyboard.KeyCodes;
    this.#up = scene.input.keyboard.addKey(UP);
    this.#left = scene.input.keyboard.addKey(LEFT);
    this.#right = scene.input.keyboard.addKey(RIGHT);
    this.#w = scene.input.keyboard.addKey(W);
    this.#a = scene.input.keyboard.addKey(A);
    this.#d = scene.input.keyboard.addKey(D);
    this.#jump = scene.input.keyboard.addKey(SPACE);
    this.#equip = scene.input.keyboard.addKey(E);
  }
  
  get isFiring() {
    return this.scene.input.activePointer.isDown;
  }
  
  get angle() {
    const pointer = this.scene.input.activePointer;
    const player = this.player.character.display.sprite;
    return Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);
  }

  get left() {
    return this.#left.isDown || this.#a.isDown;
  }

  get right() {
    return this.#right.isDown || this.#d.isDown;
  }

  get jump() {
    return this.#jump.isDown || this.#up.isDown || this.#w.isDown;
  }

  _lastGunHeld: boolean = false;
  get isHeld() {
    if (Phaser.Input.Keyboard.JustDown(this.#equip)) {
      this._lastGunHeld = !this._lastGunHeld;
    }

    return this._lastGunHeld;
  }

  set isHeld(value) {
    this._lastGunHeld = value;
  }
}