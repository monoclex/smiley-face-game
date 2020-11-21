import urlSmile from "../../../../assets/smile.png";
import CosmeticModel from "../../../../game/characters/cosmetics/CosmeticModel";
import key from "../../../../game/characters/cosmetics/key";

class Model implements CosmeticModel {
  readonly type = "smile";

  load(loader: Phaser.Loader.LoaderPlugin): void {
    loader.image(key(this.type), urlSmile);
  }
}

export default new Model();
