import { NetworkClient } from "@smiley-face-game/api/NetworkClient";

// any random things an event system needs gets shoved in here.
export default interface Deps {
  input: Phaser.Input.InputPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
  scene: Phaser.Scene,
  networkClient: NetworkClient,
}