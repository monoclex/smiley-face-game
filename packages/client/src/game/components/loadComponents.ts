// import CharacterDisplay from "../../game/components/character/CharacterDisplay";
// import GunDisplay from "../../game/guns/GunDisplay";
import BulletDisplay from "../../game/components/bullet/BulletDisplay";
import TileManager from "../../game/world/TileManager";

export default function loadComponentDisplays(loader: Phaser.Loader.LoaderPlugin) {
  BulletDisplay.load(loader);
  // CharacterDisplay.load(loader);
  // GunDisplay.load(loader);
  TileManager.load(loader);
}
