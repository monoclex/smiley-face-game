import loadAllCharacters from "../game/characters/loadAll";
import loadAllGuns from "../game/guns/loadAll";
import urlOriginal from "../assets/base.png";

import BulletDisplay from "../game/components/bullet/BulletDisplay";
import TileManager from "../game/world/TileManager";

export default function loadAll(loader: Phaser.Loader.LoaderPlugin) {
  BulletDisplay.load(loader);
  TileManager.load(loader);

  loader.image("base-original", urlOriginal);
  loadAllCharacters(loader);
  loadAllGuns(loader);
}
