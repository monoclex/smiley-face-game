import BaseModel from "./BaseModel";
import BaseType from "./BaseType";

import OriginalModel from "@/game/characters/bases/variants/OriginalModel";

const baseLookup: { [key in BaseType]: BaseModel } = {
  original: OriginalModel,
};

export default baseLookup;
