import urlOriginal from "@/assets/base.png";
import BaseModel from "@/game/characters/bases/BaseModel";
import key from "@/game/characters/bases/key";

class Model implements BaseModel {
  readonly type = "original";

  load(loader: Phaser.Loader.LoaderPlugin): void {
    loader.image(key("original"), urlOriginal);
  }
}

export default new Model();
