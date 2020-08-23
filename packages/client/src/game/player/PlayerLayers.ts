export default interface PlayerLayers {
  readonly bullets: Phaser.GameObjects.Container;
  readonly strappedGuns: Phaser.GameObjects.Container;
  readonly player: Phaser.GameObjects.Container;
  readonly heldGun: Phaser.GameObjects.Container;
}
