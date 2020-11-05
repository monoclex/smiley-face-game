
/**
 * To support the `for await` pattern of `Connection` when receiving messages, we need to have some kind of queue
 * structure that will handle incoming packets. This isn't meant to use publicly, but could be if need be.
 */
export default class AsyncQueue<T> {
  /**
   * The promise used to determine when a value is inserted into the queue.
   */
  private _next: Promise<T>;

  /**
   * If `_next` has already been resolved (i.e. from the `_buffer`), this will be true. This is used in `push` to
   * determine if `_resolve` should be called, or if the value should be pushed into `_buffer`.
   */
  private _prepared: boolean;

  /**
   * A function that will resolve the `_next` promise. This is typically called upon when a method is `push`ed into
   * the queue.
   */
  private _resolve!: (value: T) => void;

  /**
   * The rejection callback incase the queue needs to be cancelled.
   */
  private _reject!: (error: Error) => void;

  /**
   * A buffer that will have extra unhandled values pushed into it.
   */
  private _buffer: T[] = [];

  constructor() {
    const self = this;
    this._prepared = false;
    this._next = new Promise<T>((resolve, reject) => {
      self._resolve = resolve;
      self._reject = reject;
    });
  }

  push(value: T): void {
    console.log("push()", this);
    if (this._prepared) {
      // `_next` is already prepared for a call to `next()`, we can't call `_resolve`
      this._buffer.push(value);
    }
    else {
      // we mark the queue as prepared after we resolve the promise so that no more entries
      // go into the queue
      this._prepared = true;
      this._resolve(value);
    }
  }

  end(error: Error): void {
    this._reject(error);

    // we don't want to call `_reject` again
    this._reject = () => { };
  }

  next(): Promise<T> {
    console.log("next()", this);
    const self = this;
    return this._next.then(value => {
      console.log("next consuming buffer");
      // once we consume the next value, we want to prepare `_next` again for the next iteration
      if (self._buffer.length > 0) {
        console.log("next resolving to buffer next time");
        // if there's stuff in the buffer, we'll prepare an already resolve `_next` with stuff in the buffer.
        self._prepared = true;
        self._next = Promise.resolve(self._buffer[0]);
        self._buffer.shift();
      }
      else {
        console.log("next resolving to next push");
        // otherwise, prepare a `_next` to be resolved on the next `push`
        self._prepared = false;
        self._next = new Promise<T>((resolve, reject) => {
          self._resolve = resolve;
          self._reject = reject;
        });
      }
      return value;
    });
  }
}