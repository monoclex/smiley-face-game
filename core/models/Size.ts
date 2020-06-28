import { number, Schema, Type } from "../../deps.ts";

export const SizeSchema = Schema({
  width: number.gte(0).integer(),
  height: number.gte(0).integer(),
});
export type Size = Type<typeof SizeSchema>;
