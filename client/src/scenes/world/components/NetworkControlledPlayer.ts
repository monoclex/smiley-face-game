import { Character, CharacterController } from './Character';
import MultiKey from './MultiKey';
import { NetworkClient } from '../../../networking/NetworkClient';
import { ControllerState } from './KeyboardControlledPlayer';

class ReferenceController implements CharacterController {
  isLeft(): boolean {
    return this.left;
  }

  isRight(): boolean {
    return this.right;
  }

  isUp(): boolean {
    return this.up;
  }

  left: boolean = false;
  right: boolean = false;
  up: boolean = false;
}

interface Position {
  readonly x: number;
  readonly y: number;
}

export class NetworkControlledPlayer {
  readonly _controller: ReferenceController;
  readonly character: Character;

  constructor(scene: Phaser.Scene, spawnPosition: Position) {
    this._controller = new ReferenceController();
    this.character = new Character(scene, this._controller, spawnPosition);
  }

  onMove(position: Position, velocity: MatterJS.Vector, inputs: ControllerState) {
    this.character.sprite.setPosition(position.x, position.y);
    this.character.sprite.setVelocity(velocity.x, velocity.y);

    // TODO: do this in some cleaner way, where we shouldn't even need to specify this
    // should just be able to tell the character that "hey you're going x way now" and it'll be like "ok"
    // for now this is a hack to make it feel similar to keyboard input
    this._controller.left = inputs.left;
    this._controller.right = inputs.right;
    this._controller.up = inputs.up;
  }
}