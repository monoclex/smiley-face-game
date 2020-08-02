export class AsyncLock {
  private _completion: PromiseCompletionSource<undefined>;
  private _free: boolean;

  constructor() {
    this._completion = new PromiseCompletionSource<undefined>();
    this._free = true;
  }

  async acquire(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this._free) {
        this._free = false;
        this._completion = new PromiseCompletionSource<undefined>();
        return;
      }

      // not free, have to wait for it to be released
      await this._completion.promise;
    }
  }

  release(): void {
    this._free = true;
    this._completion.resolve();
  }
}

export class PromiseCompletionSource<T> {
  readonly promise: Promise<T>;
  readonly resolve!: (value?: T | PromiseLike<T> | undefined) => void;
  readonly reject!: (reason?: any) => void;

  constructor() {
    // i don't know if this is needed but im not taking any chances
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.promise = new Promise((resolve, reject) => {
      //@ts-expect-error
      self.resolve = resolve;
      //@ts-expect-error
      self.reject = reject;
    });
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
