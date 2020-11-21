import urlGlasses from "../../../../assets/glasses.png";
import CosmeticModel from "../../../../game/characters/cosmetics/CosmeticModel";
import key from "../../../../game/characters/cosmetics/key";

class Model implements CosmeticModel {
  readonly type = "glasses";

  load(loader: Phaser.Loader.LoaderPlugin): void {
    loader.image(key(this.type), urlGlasses);
  }
}

export default new Model();
