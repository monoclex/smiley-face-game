import { ServerPlayerJoinPacket } from '@smiley-face-game/api/src/networking/packets/ServerPlayerJoin';
import { WorldScene } from "../WorldScene";
import { captureInputs, inputsDiffer, InputState } from './InputState';
import MultiKey from "./MultiKey";
import { Player } from './Player';

export class PrimaryPlayer extends Player {

  keyUp: MultiKey;
  keyLeft: MultiKey;
  keyRight: MultiKey;
  keyEquip: MultiKey;

  private get networkClient() { return this.worldScene.networkClient; }
  private get pointer() { return this.worldScene.input.activePointer; }

  private _lastInputs: InputState;
  private _tickCounter = 0;

  constructor(readonly worldScene: WorldScene, onPlayerJoinEvent: ServerPlayerJoinPacket) {
    super(worldScene, onPlayerJoinEvent);
    this._lastInputs = captureInputs(this);

    // TODO: allow people to specify input
    // i'm lazy and i know this will only be used for main player, so i'm hardcoding keyboard here
    const { UP, LEFT, RIGHT, W, A, D, SPACE, E } = Phaser.Input.Keyboard.KeyCodes;
    this.keyUp = new MultiKey(worldScene, [W, UP, SPACE]);
    this.keyLeft = new MultiKey(worldScene, [A, LEFT]);
    this.keyRight = new MultiKey(worldScene, [D, RIGHT]);
    this.keyEquip = new MultiKey(worldScene, E);

    worldScene.events.on('update', this.primaryPlayerUpdate, this);

    this.onGunAttached = () => this.gun.onBulletFired = this.onBulletShot.bind(this);
  }

  // this isn't named 'update' to prevent collision with Player.update
  primaryPlayerUpdate() {
    this.upHeld = this.keyUp.isDown();
    this.leftHeld = this.keyLeft.isDown();
    this.rightHeld = this.keyRight.isDown();

    const inputs = captureInputs(this);

    if (inputsDiffer(this._lastInputs, inputs) || this._tickCounter > 100) {
      this._tickCounter = 0;
      this.networkClient.move(this.sprite, inputs);

      this._lastInputs = inputs;
    }

    if (this.hasGun) {
      this.gun.firing = this.pointer.isDown;

      if (this.keyEquip.justDown()) {
        const equipState = !this.gun.equipped;
        this.gun.doEquip(equipState);
        this.networkClient.equipGun(equipState);
      }
    }

    this._tickCounter++;
  }

  onBulletShot() {
    this.networkClient.fireBullet(this.gun.angle);
  }
}
