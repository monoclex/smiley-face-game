import baseLookup from "@/game/characters/bases/baseLookup";
import cosmeticLookup from "@/game/characters/cosmetics/cosmeticLookup";

export default function loadAll(loader: Phaser.Loader.LoaderPlugin) {
  for (const key in baseLookup) {
    // @ts-ignore
    baseLookup[key].load(loader);
  }
  
  for (const key in cosmeticLookup) {
    // @ts-ignore
    cosmeticLookup[key].load(loader);
  }
}
