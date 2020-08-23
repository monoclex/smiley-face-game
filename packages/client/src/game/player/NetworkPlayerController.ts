import PlayerController from "./PlayerController";

// you could use this for player input too technically, i've just decided not to to ensure the distinction is clearer
export default class NetworkPlayerController implements PlayerController {
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
  isHeld: boolean = false;

  private _gotX: boolean = false;
  private _x: number;
  private _gotY: boolean = false;
  private _y: number;
  
  constructor(x: number, y: number) {
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

  updateGunEquipped(gunEquipped: boolean) {
    this.isHeld = gunEquipped;
  }
}
