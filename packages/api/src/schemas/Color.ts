import Schema, { array, number, string } from "computed-types";
import { Type } from "computed-types";

export const ColorSchema = Schema.either(
  "white" as const,
  "black" as const,
  "brown" as const,
  "red" as const,
  "orange" as const,
  "yellow" as const,
  "green" as const,
  "blue" as const,
  "purple" as const,
);
export type Color = Type<typeof ColorSchema>;
export const validateColor = ColorSchema.destruct();
