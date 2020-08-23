export default class NetworkGunController {

  isHeld: boolean = false;
  angle: number = 0;
  
  private _hasFired: boolean = false;
  get isFiring() {
    if (this._hasFired) {
      this._hasFired = false;
      return true;
    }
    return false;
  }
}
