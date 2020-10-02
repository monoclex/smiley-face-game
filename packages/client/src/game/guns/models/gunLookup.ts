import GunModel from "@/game/guns/models/GunModel";
import GunType from "@/game/guns/models/GunType";

import M249LMG from "@/game/guns/models/variants/M249LMG";

const gunLookup: { [key in GunType]: GunModel } = {
  m249lmg: M249LMG,
};

export default gunLookup;
