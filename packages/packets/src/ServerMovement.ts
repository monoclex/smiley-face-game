import Schema, { Type } from "computed-types";
import { InputsSchema } from "@smiley-face-game/schemas/Inputs";
import { PlayerPositionSchema } from "@smiley-face-game/schemas/PlayerPosition";
import { ServerSchema } from "./Server";
import { PhysicsVelocitySchema } from "@smiley-face-game/schemas/PhysicsVelocity";

export const SERVER_MOVEMENT_ID = "SERVER_MOVEMENT";
export const ServerMovementSchema = Schema.merge(
  {
    packetId: SERVER_MOVEMENT_ID as typeof SERVER_MOVEMENT_ID,
    position: PlayerPositionSchema,
    velocity: PhysicsVelocitySchema,
    inputs: InputsSchema,
  },
  ServerSchema
);
export type ServerMovementPacket = Type<typeof ServerMovementSchema>;
export const validateServerMovement = ServerMovementSchema.destruct();
