import Schema, { Type } from "computed-types";
import { InputsSchema } from "../../schemas/Inputs";
import { PlayerPositionSchema } from "../../schemas/PlayerPosition";

export const MOVEMENT_ID = 'MOVEMENT';
export const MovementSchema = Schema({
  packetId: MOVEMENT_ID as typeof MOVEMENT_ID,
  position: PlayerPositionSchema,
  inputs: InputsSchema,
});
export type MovementPacket = Type<typeof MovementSchema>;
export const validateMovement = MovementSchema.destruct();
