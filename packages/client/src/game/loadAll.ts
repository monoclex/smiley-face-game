// import urlGlasses from "../assets/glasses.png";
import urlSmile from "../assets/smile.png";
import loadAllGuns from "../game/guns/loadAll";
import urlOriginal from "../assets/base.png";
import urlBullet from "../assets/bullet.png";
import urlShoot from "../assets/shoot.mp3";
import TileManager from "../game/world/TileManager";

export default function loadAll(loader: Phaser.Loader.LoaderPlugin) {
  loader.image("bullet-bullet", urlBullet);
  loader.audio("shoot", urlShoot);
  TileManager.load(loader);

  loader.image("base-original", urlOriginal);
  loader.image("cosmetic-smile", urlSmile);
  // loader.image("cosmetic-glasses", urlGlasses);
  loadAllGuns(loader);
}
