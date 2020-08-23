import GunBehaviour from "@/game/guns/behaviour/GunBehaviour";
import GameScene from "@/game/GameScene";

export default interface GunModel {
  behaviourFactory: (game: GameScene, player: Phaser.GameObjects.Sprite) => GunBehaviour;
  load(loader: Phaser.Loader.LoaderPlugin): void;
}
