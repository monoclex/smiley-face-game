/**
 * An infinitely expandable ring buffer.
 * Note: not actually a ring buffer, but that's TODO.
 */
export default class RingBuffer<T> {
  // TODO: make or use a proper ring buffer
  #buffer: T[];

  constructor() {
    this.#buffer = [];
  }

  push(element: T): void {
    this.#buffer.push(element);
  }

  pop(): T | undefined {
    return this.#buffer.shift();
  }

  peek(): boolean {
    return this.#buffer.length > 0;
  }
}