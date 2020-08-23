import BaseType from "./BaseType";

export default interface BaseModel {
  readonly type: BaseType;
  load(loader: Phaser.Loader.LoaderPlugin): void;
}
