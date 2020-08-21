import CharacterDisplay from "@/game/components/character/CharacterDisplay";
import GunDisplay from "@/game/components/gun/GunDisplay";
import BulletDisplay from "@/game/components/bullet/BulletDisplay";
import TileManager from "@/game/tiles/TileManager";

export default function loadComponentDisplays(loader: Phaser.Loader.LoaderPlugin) {
  BulletDisplay.load(loader);
  CharacterDisplay.load(loader);
  GunDisplay.load(loader);
  TileManager.load(loader);
}
