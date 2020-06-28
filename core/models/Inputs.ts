import { boolean, Schema, Type } from "../../deps.ts";

// TODO: way to constrain maximum number?
export const InputsSchema = Schema({
  left: boolean,
  right: boolean,
  up: boolean,
});
export type Inputs = Type<typeof InputsSchema>;
export const validateInputs = InputsSchema.destruct();
