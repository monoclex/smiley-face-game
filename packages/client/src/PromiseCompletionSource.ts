export default class PromiseCompletionSource<T> {
  handle: Promise<T>;
  resolved = false;
  resolvedValue!: T;

  resolve!: (value: T) => void;
  // reject!: (error: any) => void;

  constructor() {
    this.handle = new Promise((resolve) => {
      this.resolve = (value: T) => {
        this.resolved = true;
        this.resolvedValue = value;
        return resolve(value);
      };
      // this.reject = reject;
    });
  }
}
