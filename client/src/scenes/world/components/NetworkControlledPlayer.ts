import { Character, CharacterController } from './Character';
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

  private _angle: number | null = null;
  gunAngle(): number | null {
    return this._angle;
  }

  setAngle(value: number) {
    this._angle = value;
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

  constructor(scene: Phaser.Scene, spawnPosition: Position, hasGun: boolean, bulletGroup: Phaser.GameObjects.Group) {
    this._controller = new ReferenceController();
    this.character = new Character(scene, this._controller, spawnPosition, hasGun, bulletGroup, false);
  }

  onMove(position: Position, inputs: ControllerState) {
    this.character.sprite.setPosition(position.x, position.y);
    
    this._controller.left = inputs.left;
    this._controller.right = inputs.right;
    this._controller.up = inputs.up;
  }
}