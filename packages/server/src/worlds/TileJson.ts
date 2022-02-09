import tileJson from "@smiley-face-game/api/tiles/tiles";
import { zTileJsonFile } from "@smiley-face-game/api/types";
import createRegistration from "@smiley-face-game/api/tiles/createRegistration";
const tileJsonFile = zTileJsonFile.parse(tileJson);

export default createRegistration(tileJsonFile);
