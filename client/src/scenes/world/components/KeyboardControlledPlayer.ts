import { CharacterController, Character } from './Character';
import MultiKey from './MultiKey';
import { NetworkClient } from '../../../networking/NetworkClient';
import { RoomIdSchema } from '../../../libcore/core/models/RoomId';

class KeyboardController implements CharacterController {
  constructor(
    private readonly _up: MultiKey,
    private readonly _left: MultiKey,
    private readonly _right: MultiKey,
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

  constructor(
    scene: Phaser.Scene,
    spawnPosition: Position,
    private readonly _networkClient: NetworkClient
  ) {
    // TODO: allow people to specify input
    // i'm lazy and i know this will only be used for main player, so i'm hardcoding keyboard here
    const { UP, LEFT, RIGHT, W, A, D, SPACE } = Phaser.Input.Keyboard.KeyCodes;

    this._controller = new KeyboardController(
      new MultiKey(scene, [SPACE, UP, W]),
      new MultiKey(scene, [LEFT, A]),
      new MultiKey(scene, [RIGHT, D]),
    );

    this.character = new Character(scene, this._controller, spawnPosition);
    
    this._last = { left: false, right: false, up: false };
    scene.events.on('update', this._update, this);
  }

  private _last: ControllerState;

  private _update() {
    const state = capture(this._controller);

    if (this._last.left !== state.left
      || this._last.right !== state.right
      || this._last.up !== state.up) {

      this._networkClient.move(
        this.character.getMatterJSBody().position,
        this.character.getMatterJSBody().velocity,
        state
      );
    }

    this._last = state;
  }
}