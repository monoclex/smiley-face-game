import Schema, { number, Type } from "computed-types";

// TODO: way to constrain maximum number?
export const PlayerPositionSchema = Schema({
  x: number,
  y: number,
});
export type PlayerPosition = Type<typeof PlayerPositionSchema>;
export const validatePlayerPosition = PlayerPositionSchema.destruct();
