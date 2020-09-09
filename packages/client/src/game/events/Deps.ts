import { NetworkClient } from "@smiley-face-game/api/NetworkClient";

export default interface Deps {
  input: Phaser.Input.InputPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
  scene: Phaser.Scene,
  networkClient: NetworkClient,
}