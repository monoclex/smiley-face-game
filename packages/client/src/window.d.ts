// https://stackoverflow.com/a/12709880
import GameScene from "@/game/GameScene";

declare global {
  interface Window {
    gameScene: GameScene;
    game: Phaser.Game;
  }
}
