// import urlGlasses from "../assets/glasses.png";
import urlSmile from "../assets/smile.png";
import loadAllGuns from "../game/guns/loadAll";
import urlOriginal from "../assets/base.png";

import BulletDisplay from "../game/components/bullet/BulletDisplay";
import TileManager from "../game/world/TileManager";

export default function loadAll(loader: Phaser.Loader.LoaderPlugin) {
  BulletDisplay.load(loader);
  TileManager.load(loader);

  loader.image("base-original", urlOriginal);
  loader.image("cosmetic-smile", urlSmile);
  // loader.image("cosmetic-glasses", urlGlasses);
  loadAllGuns(loader);
}
