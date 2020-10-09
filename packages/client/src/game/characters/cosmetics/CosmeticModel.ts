import CosmeticType from "../../../game/characters/cosmetics/CosmeticType";

export default interface CosmeticModel {
  readonly type: CosmeticType;
  load(loader: Phaser.Loader.LoaderPlugin): void;
}
