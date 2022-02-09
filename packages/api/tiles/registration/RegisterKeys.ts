import Schema, { array, SchemaInput, string } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { GenericRegistration, registrations } from "./Registrations";

const key = "keys" as const;
let _: keyof typeof registrations = key;

export const zRegisterKeys = addParse(
  Schema({
    behavior: key,
    name: string,
    tiles: array.of(string),
  })
);
export type ZRegisterKeys = SchemaInput<typeof zRegisterKeys>;

export function registerKeys(mgr: GenericRegistration) {
  //
}
