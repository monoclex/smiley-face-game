import CosmeticModel from "./CosmeticModel";
import CosmeticType from "./CosmeticType";

import SmileModel from "../../../game/characters/cosmetics/variants/SmileModel";
import GlassesModel from "../../../game/characters/cosmetics/variants/GlassesModel";

const cosmeticLookup: { [key in CosmeticType]: CosmeticModel } = {
  smile: SmileModel,
  glasses: GlassesModel,
};

export default cosmeticLookup;
