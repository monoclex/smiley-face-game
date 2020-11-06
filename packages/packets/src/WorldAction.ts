import Schema, { SchemaInput } from "computed-types";
import { WorldActionKindSchema } from "@smiley-face-game/schemas/WorldActionKind";

export const WORLD_ACTION_ID = "WORLD_ACTION";
export const WorldActionSchema = Schema(
  {
    packetId: WORLD_ACTION_ID as typeof WORLD_ACTION_ID,
    action: WorldActionKindSchema
  },
);
export type WorldActionPacket = SchemaInput<typeof WorldActionSchema>;
export const validateWorldAction = WorldActionSchema.destruct();
