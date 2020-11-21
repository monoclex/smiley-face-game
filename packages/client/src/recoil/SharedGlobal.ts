type RecoilEffects<T> = { setSelf: (value: T) => void; onSet: (callback: (value: T) => void) => void };

export default class SharedGlobal<T> {
  private _setSelf?: (value: T) => void;
  private _onSet?: (callback: (value: T) => void) => void;
  private _value: T;

  /**
   * If we set/modify the SharedGlobal<T> and the update isn't reflected in the react side of things, we'll
   * want to use our modification when we get `state` until the react side of things updates.
   */
  private _updateReflected: boolean = true;
  private _lastSet: T;

  constructor(value: T) {
    this._lastSet = this._value = value;
    this.initialize = this.initialize.bind(this);
  }

  initialize({ setSelf, onSet }: RecoilEffects<T>): void {
    this._setSelf = setSelf;
    this._onSet = onSet;
    this._onSet((value: T) => {
      this._updateReflected = true;
      this._value = value;
    });
  }

  get state(): T {
    if (!this._onSet) {
      console.warn("getting state when hooks not registered yet");
    }

    if (!this._updateReflected) {
      return this._lastSet;
    }

    return this._value;
  }

  set(payload: T) {
    if (!this._setSelf) {
      console.warn("setting state when hooks not registered yet");
      this._value = payload;
      return;
    }

    this._lastSet = payload;
    this._updateReflected = false;
    this._setSelf(payload);
  }

  modify(modification: Partial<T>) {
    this.set({ ...this.state, ...modification });
  }
}
