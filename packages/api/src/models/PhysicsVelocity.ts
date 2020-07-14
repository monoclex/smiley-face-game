import Schema, { number, Type } from "computed-types";

export const PhysicsVelocitySchema = Schema({
  x: number,
  y: number,
});
export type PhysicsVelocity = Type<typeof PhysicsVelocitySchema>;
export const validatePhysicsVelocity = PhysicsVelocitySchema.destruct();
