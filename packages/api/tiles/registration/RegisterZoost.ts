import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { GenericRegistration, registrations } from "./Registrations";

const key = "zoost" as const;
let _: keyof typeof registrations = key;

export const zRegisterZoost = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterZoost = SchemaInput<typeof zRegisterZoost>;

export function registerZoost(mgr: GenericRegistration) {
  //
}
