/**
 * A {@link MutableVariable} is often used to be able to idiomatically export some kind of
 * global variable that needs to be mutated. Its most common use-case is as a write-only
 * container that React code writes into, and a read-only container that the Game code
 * reads from.
 */
export class MutableVariable<T> {
  constructor(public value: T) {}
}
