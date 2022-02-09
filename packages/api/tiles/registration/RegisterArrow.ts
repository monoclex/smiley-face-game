import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { GenericRegistration, registrations } from "./Registrations";

const key = "arrow" as const;
let _: keyof typeof registrations = key;

export const zRegisterArrow = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterArrow = SchemaInput<typeof zRegisterArrow>;

export function registerArrow(mgr: GenericRegistration) {
  //
}
