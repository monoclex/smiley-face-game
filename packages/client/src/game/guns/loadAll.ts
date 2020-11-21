import gunLookup from "../../game/guns/models/gunLookup";

export default function loadAll(loader: Phaser.Loader.LoaderPlugin) {
  for (const modelKey in gunLookup) {
    //@ts-ignore
    gunLookup[modelKey].load(loader);
  }
}
