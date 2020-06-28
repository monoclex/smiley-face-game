
//@ts-ignore
import urlAtlas from "./atlas.png";
//@ts-ignore
import urlAtlasJson from "./atlas.json.txt";
//@ts-ignore
import urlPlayer from "./mmmyep.png";

/**
 * @param {Phaser.Loader.LoaderPlugin} loader 
 */
export function loadAll(loader) {
  loader.atlas("atlas", urlAtlas, urlAtlasJson);
  loader.image("player", urlPlayer);
}
