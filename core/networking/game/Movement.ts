import { Schema, Type } from "../../../deps.ts";
import { InputsSchema } from "../../models/Inputs.ts";
import { PlayerPositionSchema } from "../../models/PlayerPosition.ts";

export const MOVEMENT_ID = 'MOVEMENT';
export const MovementSchema = Schema({
  packetId: MOVEMENT_ID,
  position: PlayerPositionSchema,
  inputs: InputsSchema,
});
export type MovementPacket = Type<typeof MovementSchema>;
export const validateMovement = MovementSchema.destruct();
