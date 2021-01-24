export default class PromiseCompletionSource<T> {
  handle: Promise<T>;

  resolve!: (value: T) => void;
  reject!: (error: any) => void;

  constructor() {
    this.handle = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
