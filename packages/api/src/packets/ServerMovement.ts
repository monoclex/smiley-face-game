import Schema, { Type } from "computed-types";
import { InputsSchema } from "../schemas/Inputs";
import { PlayerPositionSchema } from "../schemas/PlayerPosition";
import { ServerSchema } from "./Server";

export const SERVER_MOVEMENT_ID = 'SERVER_MOVEMENT';
export const ServerMovementSchema = Schema.merge({
  packetId: SERVER_MOVEMENT_ID as typeof SERVER_MOVEMENT_ID,
  position: PlayerPositionSchema,
  inputs: InputsSchema,
}, ServerSchema);
export type ServerMovementPacket = Type<typeof ServerMovementSchema>;
export const validateServerMovement = ServerMovementSchema.destruct();
