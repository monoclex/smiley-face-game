import Schema, { Type } from "computed-types";
import { ServerSchema } from "./Server";
import { WorldActionKindSchema } from "../../schemas/src/WorldActionKind";

export const SERVER_WORLD_ACTION_ID = "SERVER_WORLD_ACTION";
export const ServerWorldActionSchema = Schema.merge(
  {
    packetId: SERVER_WORLD_ACTION_ID as typeof SERVER_WORLD_ACTION_ID,
  },
  WorldActionKindSchema,
  ServerSchema
);
export type ServerWorldActionPacket = Type<typeof ServerWorldActionSchema>;
export const validateServerWorldAction = ServerWorldActionSchema.destruct();
