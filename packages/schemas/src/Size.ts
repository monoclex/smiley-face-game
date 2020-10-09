import Schema, { number, Type } from "computed-types";

export const SizeSchema = Schema({
  width: number.gte(0).integer(),
  height: number.gte(0).integer(),
});
export type Size = Type<typeof SizeSchema>;
