import Inputs from "../interfaces/Inputs";

export default function areSame(a: Inputs, b: Inputs) {
  return a.up === b.up && a.down === b.down && a.left === b.left && a.right === b.right && a.jump === b.jump;
}
