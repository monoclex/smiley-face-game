/**
 * Similar to C#'s TaskCompletionSource. Allows one worker to independently signal another.
 */
export default class PromiseCompletionSource<T> {
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
