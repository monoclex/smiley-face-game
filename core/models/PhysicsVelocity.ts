import { number, Schema, Type } from "../../deps.ts";

export const PhysicsVelocitySchema = Schema({
  x: number,
  y: number,
});
export type PhysicsVelocity = Type<typeof PhysicsVelocitySchema>;
export const validatePhysicsVelocity = PhysicsVelocitySchema.destruct();
