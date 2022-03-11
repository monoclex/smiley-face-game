export default class ReactMutableVariable<T> {
  private setter: (update: T) => void;
  private _value: T;

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    if (value === this._value) return;
    this._value = value;
    this.setter(value);
  }

  constructor(value: T) {
    this._value = value;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.setter = (_) => {
      // leave this a function so that we don't have to deal with the case where
      // there is no `setter` set
    };
  }

  bind(setter: (update: T) => void) {
    this.setter = setter;
  }
}
