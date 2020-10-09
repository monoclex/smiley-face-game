import loadAllCharacters from "../game/characters/loadAll";
import loadAllGuns from "../game/guns/loadAll";

import BulletDisplay from "../game/components/bullet/BulletDisplay";
import TileManager from "../game/world/TileManager";

export default function loadAll(loader: Phaser.Loader.LoaderPlugin) {
  BulletDisplay.load(loader);
  TileManager.load(loader);

  loadAllCharacters(loader);
  loadAllGuns(loader);
}
