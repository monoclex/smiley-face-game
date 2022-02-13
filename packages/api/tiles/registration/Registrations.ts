import type { ZTileRegistration, ZTileRegistrationKind } from "./RegisterJson";
import { registerArrow } from "./RegisterArrow";
import { registerBoost } from "./RegisterBoost";
import { registerEmpty } from "./RegisterEmpty";
import { registerGun } from "./RegisterGun";
import { registerKeys } from "./RegisterKeys";
import { registerSolid } from "./RegisterSolid";
import { registerZoost } from "./RegisterZoost";
import { registerSign } from "./RegisterSign";
import { registerSpike } from "./RegisterSpike";

import type { GenericRegistration } from "../TileRegistration";
export type { GenericRegistration };

type RegistrationFunction<K extends ZTileRegistrationKind> = (
  mgr: GenericRegistration,
  data: DataFromKey<K>
) => void;
type DataFromKey<K extends ZTileRegistrationKind> = Extract<ZTileRegistration, { behavior: K }>;

export const registrations: { [K in ZTileRegistrationKind]: RegistrationFunction<K> } = {
  empty: registerEmpty,
  solid: registerSolid,
  gun: registerGun,
  arrow: registerArrow,
  boost: registerBoost,
  zoost: registerZoost,
  keys: registerKeys,
  sign: registerSign,
  spike: registerSpike,
};
