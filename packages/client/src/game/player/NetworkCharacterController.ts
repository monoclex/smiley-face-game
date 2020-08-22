import CharacterController from "@/game/components/character/CharacterController";
import { NetworkClient } from "../../../../api/src/NetworkClient";

export class InputCharacterController implements CharacterController {
  get x() {
    if (this._gotX) return undefined;
    this._gotX = true;
    return this._x;
  }

  get y() {
    if (this._gotY) return undefined;
    this._gotY = true;
    return this._y;
  }

  left: boolean = false;
  right: boolean = false;
  jump: boolean = false;

  private _gotX: boolean = false;
  private _x: number;
  private _gotY: boolean = false;
  private _y: number;
  
  constructor(x: number, y: number, networkClient: NetworkClient) {
    this._x = x;
    this._y = y;
  }

  updatePosition(x: number, y: number) {
    this._gotX = false;
    this._gotY = false;
    this._x = x;
    this._y = y;
  }

  updateInput(left: boolean, right: boolean, jump: boolean) {
    this.left = left;
    this.right = right;
    this.jump = jump;
  }
}
