// https://stackoverflow.com/a/12709880
import GameScene from "./game/GameScene";
import type Phaser from "phaser";

declare global {
  interface Window {
    gameScene: GameScene;
    game: Phaser.Game;
  }
}
