import urlGun from "../../../../assets/held_gun.png";
import OneBulletFixedFireRate from "../../../../game/guns/behaviour/OneBulletFixedFireRate";
import GunModel from "../../../../game/guns/models/GunModel";
import key from "../../../../game/guns/models/key";
import Player from "../../../../game/player/Player";
import GameScene from "../../../../game/GameScene";

class Model implements GunModel {
  behaviourFactory(game: GameScene, player: Player): [OneBulletFixedFireRate, Phaser.GameObjects.Sprite] {
    const body = player.body;
    const gun = new Phaser.GameObjects.Sprite(game, body.x, body.y, key("m249lmg"));
    game.events.on("update", gun.update, gun);
    return [new OneBulletFixedFireRate(game, body, gun, 100), gun];
  }

  load(loader: Phaser.Loader.LoaderPlugin): void {
    loader.image(key("m249lmg"), urlGun);
  }
}

export default new Model();
