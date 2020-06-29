import { ServerPlayerJoinPacket } from '../../../libcore/core/networking/game/ServerPlayerJoin';
import { WorldScene } from "../WorldScene";
import MultiKey from "./MultiKey";
import { Player } from './Player';

export class PrimaryPlayer extends Player {

  keyUp: MultiKey;
  keyLeft: MultiKey;
  keyRight: MultiKey;
  keyShoot: MultiKey;

  constructor(readonly worldScene: WorldScene, onPlayerJoinEvent: ServerPlayerJoinPacket) {
    super(worldScene, onPlayerJoinEvent);

    // TODO: allow people to specify input
    // i'm lazy and i know this will only be used for main player, so i'm hardcoding keyboard here
    const { UP, LEFT, RIGHT, W, A, D, SPACE, E, CTRL } = Phaser.Input.Keyboard.KeyCodes;
    this.keyUp = new MultiKey(worldScene, [W, UP, SPACE]);
    this.keyLeft = new MultiKey(worldScene, [A, LEFT]);
    this.keyRight = new MultiKey(worldScene, [D, RIGHT]);
    this.keyShoot = new MultiKey(worldScene, [E, CTRL]);

    worldScene.events.on('update', this.beforeUpdate, this);
  }

  beforeUpdate() {
    this.upHeld = this.keyUp.isDown();
    this.leftHeld = this.keyLeft.isDown();
    this.rightHeld = this.keyRight.isDown();
    
    if (this.hasGun) {
      this.gun.firing = this.keyShoot.isDown();
    }
  }
}
