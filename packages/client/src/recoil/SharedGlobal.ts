type RecoilEffects<T> = { setSelf: (value: T) => void, onSet: (callback: (value: T) => void) => void }

export default class SharedGlobal<T> {
  private _setSelf?: (value: T) => void;
  private _onSet?: (callback: (value: T) => void) => void;
  private _value: T;

  constructor(value: T) {
    this._value = value;
    this.initialize = this.initialize.bind(this);
  }

  initialize({ setSelf, onSet }: RecoilEffects<T>): void {
    this._setSelf = setSelf;
    this._onSet = onSet;
    this._onSet((value: T) => {
      this._value = value;
    });
  }

  get state(): T {
    if (!this._onSet) {
      console.warn("getting state when hooks not registered yet");
    }

    return this._value;
  }

  modify(modification: Partial<T>) {
    if (!this._setSelf) {
      console.warn("setting state when hooks not registered yet");
      this._value = { ...this._value, ...modification };
      return;
    }

    this._setSelf({ ...this.state, ...modification });
    return;
  }
}