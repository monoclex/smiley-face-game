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
    console.log("init", this);
    if (this._valueSynchronized === false) {
      setSelf(this._value);
    }

    this._setSelf = setSelf;
    this._onSet = onSet;
    this._onSet((value: T) => {
      console.log("onSet fired");
      this._value = value;
      if (this._userOnValue) this._userOnValue(value);
      this._valueSynchronized = true;
    });
    console.log("doneinit", this);
  }

  get state(): T {
    return this._value;
  }

  set(payload: T) {
    console.log("set fired");
    this._value = payload;
    if (this._userOnValue) this._userOnValue(payload);
    this._valueSynchronized = false;

    console.log("check setting self", this._setSelf);
    if (!this._setSelf) return;
    console.log("setting self!");
    this._setSelf(this._value);
  }

  modify(modification: Partial<T>) {
    this.set({ ...this.state, ...modification });
  }
}
