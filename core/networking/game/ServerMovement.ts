import { Schema, Type } from "../../../deps.ts";
import { InputsSchema } from "../../models/Inputs.ts";
import { PlayerPositionSchema } from "../../models/PlayerPosition.ts";
import { ServerSchema } from "./Server.ts";

export const SERVER_MOVEMENT_ID = 'SERVER_MOVEMENT';
export const ServerMovementSchema = Schema.merge({
  packetId: SERVER_MOVEMENT_ID,
  position: PlayerPositionSchema,
  inputs: InputsSchema,
}, ServerSchema);
export type ServerMovementPacket = Type<typeof ServerMovementSchema>;
export const validateServerMovement = ServerMovementSchema.destruct();
