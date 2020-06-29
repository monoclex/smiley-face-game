import { WorldScene } from '../WorldScene';
import { Character, CharacterController } from './Character';
import MultiKey from './MultiKey';

class KeyboardController implements CharacterController {
  constructor(
    private readonly _up: MultiKey,
    private readonly _left: MultiKey,
    private readonly _right: MultiKey,
    private readonly _pointer: Phaser.Input.Pointer,
    private readonly _camera: Phaser.Cameras.Scene2D.Camera,
    private readonly _position: { x: number, y: number },
  ) {}

  isLeft(): boolean {
    return this._left.isDown();
  }

  isRight(): boolean {
    return this._right.isDown();
  }

  isUp(): boolean {
    return this._up.isDown();
  }

  gunAngle(): number | null {
    const worldPosition = this._pointer.positionToCamera(this._camera) as Phaser.Math.Vector2;
    
    // get the angle from the player to the pointer
    return Phaser.Math.Angle.BetweenPoints(this._position, worldPosition);
  }
}

interface Position {
  readonly x: number;
  readonly y: number;
}

export interface ControllerState {
  up: boolean;
  left: boolean;
  right: boolean;
}

function capture(controller: CharacterController): ControllerState {
  return {
    up: controller.isUp(),
    left: controller.isLeft(),
    right: controller.isRight(),
  };
}

export class KeyboardControlledPlayer {
  readonly character: Character;
  private readonly _controller: KeyboardController;

  /** since i can't figure out how to get physics to properly sync, every 100 updates or so it just re-sends movement data because why not */
  private _updateCounter: number;

  private get networkClient() { return this.worldScene.networkClient; }

  constructor(readonly worldScene: WorldScene) {
    const spawnPosition = worldScene.initMessage.spawnPosition;
    /*,
    scene: Phaser.Scene,
    spawnPosition: Position,
    private readonly _networkClient: NetworkClient,
    bulletGroup: Phaser.GameObjects.Group,*/

    // TODO: allow people to specify input
    // i'm lazy and i know this will only be used for main player, so i'm hardcoding keyboard here
    const { UP, LEFT, RIGHT, W, A, D, SPACE } = Phaser.Input.Keyboard.KeyCodes;

    this._controller = new KeyboardController(
      new MultiKey(worldScene, [SPACE, UP, W]),
      new MultiKey(worldScene, [LEFT, A]),
      new MultiKey(worldScene, [RIGHT, D]),
      worldScene.input.activePointer,
      worldScene.cameras.main,
      null!,
    );

    this.character = new Character(worldScene, this._controller, spawnPosition, false, worldScene.groupBullets, true, worldScene.networkClient);
    (<any>this._controller)._position = this.character.sprite;
    
    this._last = { left: false, right: false, up: false };
    worldScene.events.on('update', this._update, this);
  }

  private _last: ControllerState;

  private _update() {
    this._updateCounter++;
    const state = capture(this._controller);

    if (this._last.left !== state.left
      || this._last.right !== state.right
      || this._last.up !== state.up
      || this._updateCounter > 100) {

      this._updateCounter = 0;
      this.networkClient.move(this.character.getPosition(), state);
    }

    this._last = state;
  }
}