import tileJson from "@smiley-face-game/common/tiles/tiles.json";
import { zTileJsonFile } from "@smiley-face-game/common/src/types";
import createRegistration from "@smiley-face-game/common/tiles/createRegistration";
const tileJsonFile = zTileJsonFile.parse(tileJson);

export default createRegistration(tileJsonFile);
