/**
 * An input pipe allows the outside world to push events into the pipe, where the events are typically handled by some kind of receiver.
 * In most cases, this will be the game itself.
 *
 * Given that there can be multiple sources for a single input (e.g. pressing D and RIGHT ARROW), the way this is modeled is by counting
 * how many inputs are enabled and exposing that to the game so it can easily check if something is "enabled". To keep code as lean and
 * small as possible, these properties are modeled as `undefined | number`, and it just so happens that in JS you can happily simply
 * stick `undefined | 0` in a conditional and get it to coerce to a false boolean, whereas anything that isn't 0 is true, which will
 * perfectly represent our desired behavior.
 */
export class InputPipe {
  jump?: number;
  up?: number;
  left?: number;
  right?: number;
  equip?: boolean;

  addJump(amount: -1 | 1) {
    assertInput((this.jump = (this.jump || 0) + amount));
  }

  addUp(amount: -1 | 1) {
    assertInput((this.up = (this.up || 0) + amount));
  }

  addLeft(amount: -1 | 1) {
    assertInput((this.left = (this.left || 0) + amount));
  }

  addRight(amount: -1 | 1) {
    assertInput((this.right = (this.right || 0) + amount));
  }
}

function assertInput(input: number) {
  console.assert(input >= 0, "expect the inputs to be >= 0 at all times");
}

/** The global instance of the input pipe */
const instance = new InputPipe();
export default instance;
