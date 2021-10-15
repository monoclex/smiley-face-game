import PromiseCompletionSource from "./PromiseCompletionSource";

/**
 * A **M**ulti-**P**roducer-**S**ingle-**C**onsumer message queue.
 * The only reason this is a multi-producer queue is because of JS event loop guarantees. Otherwise, this is a SPSC queue.
 */
export default class MPSC<T> {
  // it would be good for `#buffer` to be a ring buffer, but in V8
  // this is an optimization automatically applied just by using `.shift()`
  #buffer: T[];
  #completionSource: PromiseCompletionSource<void>;

  constructor() {
    this.#buffer = [];
    this.#completionSource = new PromiseCompletionSource<void>();
  }

  /**
   *
   * @param message The message to append to the queue.
   */
  send(message: T): void {
    this.#buffer.push(message);
    this.#completionSource.resolve();
  }

  /**
   * Asynchronously fetches the next message. If there is no next message, this will wait until there is one.
   */
  async next(): Promise<T> {
    while (true) {
      await this.#completionSource.promise;
      // because we're on the event loop, we can have a new completion source without worrying about another thread triggering the old one.
      this.#completionSource = new PromiseCompletionSource<void>();

      const tryTakeResult = this.tryTake();

      if (tryTakeResult === undefined) {
        continue;
      }

      return tryTakeResult;
    }
  }

  /**
   * If there are any messages in the queue, this will try to synchronously dequeue them.
   */
  tryTake(): T | undefined {
    return this.#buffer.shift();
  }

  canPeek(): boolean {
    return this.#buffer.length > 0;
  }
}
