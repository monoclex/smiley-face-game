import urlGun from "@/assets/held_gun.png";
import GunModel from "@/game/guns/models/GunModel";
import key from "@/game/guns/models/key";
import GameScene from "@/game/GameScene";
import OneBulletFixedFireRate from "@/game/guns/behaviour/OneBulletFixedFireRate";

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
