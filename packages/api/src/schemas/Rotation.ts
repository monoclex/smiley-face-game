import Schema from "computed-types";

export enum Rotation {
  Right = 0,
  Up = 1,
  Left = 2,
  Down = 3,
}
export const RotationSchema = Schema.enum(Rotation);
export const validateRotation = RotationSchema.destruct();
