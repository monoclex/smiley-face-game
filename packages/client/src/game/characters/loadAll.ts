import cosmeticLookup from "../../game/characters/cosmetics/cosmeticLookup";

export default function loadAll(loader: Phaser.Loader.LoaderPlugin) {
  for (const key in cosmeticLookup) {
    // @ts-ignore
    cosmeticLookup[key].load(loader);
  }
}
