/**
 * Similar to C#'s TaskCompletionSource. Allows one worker to independently signal another.
 */
export default class PromiseCompletionSource<T> {
  readonly promise: Promise<T>;
  readonly resolve!: (value?: T | PromiseLike<T> | undefined) => void;
  readonly reject!: (reason?: unknown) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      //@ts-expect-error the Promies api guarantees this callback to be called.
      // however, we enforce that the fields are readonly, which makes typescript
      // think that this callback could be called at any point (i.e. not just
      // in the constructor) which prevents us from assigning this value. because
      // we know this is going to be called while still in the constructor, this is safe
      this.resolve = resolve;
      //@ts-expect-error see the above
      this.reject = reject;
    });
  }
}
