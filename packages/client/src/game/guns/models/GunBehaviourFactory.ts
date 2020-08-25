import GunBehaviour from "@/game/guns/behaviour/GunBehaviour";
import GameScene from "@/game/GameScene";

type GunBehaviourFactory = (game: GameScene, player: Phaser.GameObjects.Sprite) => GunBehaviour;
export default GunBehaviourFactory;
