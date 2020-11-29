import urlGun from "../../../assets/held_gun.png";
import OneBulletFixedFireRate from "../behaviour/OneBulletFixedFireRate";
import Player from "../../player/Player";
import GameScene from "../../GameScene";

class Model {
  behaviourFactory(game: GameScene, player: Player): [OneBulletFixedFireRate, Phaser.GameObjects.Sprite] {
    const body = player.body;
    const gun = new Phaser.GameObjects.Sprite(game, body.x, body.y, "gun-m249lmg");
    game.events.on("update", gun.update, gun);
    return [new OneBulletFixedFireRate(game, body, gun, 100), gun];
  }

  load(loader: Phaser.Loader.LoaderPlugin): void {
    loader.image("gun-m249lmg", urlGun);
  }
}

export default new Model();
