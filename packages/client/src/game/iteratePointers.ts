export default function iteratePointers(input: Phaser.Input.InputPlugin): Iterable<Phaser.Input.Pointer> {
  return input.manager.pointers;
}
