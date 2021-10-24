type RecoilEffects<T> = { setSelf: (value: T) => void; onSet: (callback: (value: T) => void) => void };

export default class SharedGlobal<T> {
  private _setSelf?: (value: T) => void;
  private _onSet?: (callback: (value: T) => void) => void;
  private _userOnValue?: (value: T) => void;
  private _value: T;
  private _valueSynchronized = false;

  constructor(value: T, onValue?: (value: T) => void) {
    this._value = value;
    this._userOnValue = onValue;
    this.initialize = this.initialize.bind(this);
  }

  initialize({ setSelf, onSet }: RecoilEffects<T>): void {
    if (this._valueSynchronized === false) {
      setSelf(this._value);
    }

    this._setSelf = setSelf;
    this._onSet = onSet;
    this._onSet((value: T) => {
      this._value = value;
      if (this._userOnValue) this._userOnValue(value);
      this._valueSynchronized = true;
    });
  }

  get state(): T {
    return this._value;
  }

  set(payload: T) {
    this._value = payload;
    if (this._userOnValue) this._userOnValue(payload);
    this._valueSynchronized = false;

    if (!this._setSelf) return;
    this._setSelf(this._value);
  }

  modify(modification: Partial<T>) {
    this.set({ ...this.state, ...modification });
  }
}
