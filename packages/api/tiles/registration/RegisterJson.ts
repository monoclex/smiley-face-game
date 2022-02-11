import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { zRegisterArrow } from "./RegisterArrow";
import { zRegisterBoost } from "./RegisterBoost";
import { zRegisterEmpty } from "./RegisterEmpty";
import { zRegisterGun } from "./RegisterGun";
import { zRegisterKeys } from "./RegisterKeys";
import { zRegisterSign } from "./RegisterSign";
import { zRegisterSolid } from "./RegisterSolid";
import { zRegisterZoost } from "./RegisterZoost";

export const zTileRegistration = addParse(
  Schema.either(
    zRegisterSolid,
    zRegisterGun,
    zRegisterArrow,
    zRegisterEmpty,
    zRegisterBoost,
    zRegisterKeys,
    zRegisterZoost,
    zRegisterSign
  )
);
export type ZTileRegistration = SchemaInput<typeof zTileRegistration>;

export type ZTileRegistrationKind = ZTileRegistration["behavior"];
