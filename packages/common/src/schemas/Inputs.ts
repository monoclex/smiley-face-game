import Schema, { boolean, Type } from "computed-types";

// TODO: way to constrain maximum number?
export const InputsSchema = Schema({
  left: boolean,
  right: boolean,
  up: boolean,
  jump: boolean,
});
export type Inputs = Type<typeof InputsSchema>;
export const validateInputs = InputsSchema.destruct();
