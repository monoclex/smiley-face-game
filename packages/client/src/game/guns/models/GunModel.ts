import GunBehaviour from "../../../game/guns/behaviour/GunBehaviour";
import Player from "../../../game/player/Player";
import GameScene from "../../../game/GameScene";

export default interface GunModel {
  behaviourFactory(game: GameScene, player: Player): [GunBehaviour, Phaser.GameObjects.Sprite];
  load(loader: Phaser.Loader.LoaderPlugin): void;
}
