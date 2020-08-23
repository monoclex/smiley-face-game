import urlGun from "@/assets/held_gun.png";
import OneBulletFixedFireRate from "@/game/guns/behaviour/OneBulletFixedFireRate";
import GameScene from "@/game/GameScene";
import GunModel from "./GunModel";
import key from "./key";

class Model implements GunModel {
  behaviourFactory = (game: GameScene, player: Phaser.GameObjects.Sprite) => {
    const gun = new Phaser.GameObjects.Sprite(game, player.x, player.y, key("m249lmg"));
    return new OneBulletFixedFireRate(game, player, gun, 100);
  }

  load(loader: Phaser.Loader.LoaderPlugin): void {
    loader.image(key("m249lmg"), urlGun);
  }
}

export default new Model();
