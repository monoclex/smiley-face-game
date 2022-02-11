export default class PromiseCompletionSource<T> {
  handle: Promise<T>;
  resolved = false;
  resolvedValue!: T;

  resolve!: (value: T) => void;
  reject!: (reason?: any) => void;

  constructor() {
    this.handle = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = (value: T) => {
        this.resolved = true;
        this.resolvedValue = value;
        return resolve(value);
      };
    });
  }
}
