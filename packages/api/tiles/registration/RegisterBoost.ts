import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { GenericRegistration, registrations } from "./Registrations";

const key = "boost" as const;
let _: keyof typeof registrations = key;

export const zRegisterBoost = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterBoost = SchemaInput<typeof zRegisterBoost>;

export function registerBoost(mgr: GenericRegistration) {
  //
}
