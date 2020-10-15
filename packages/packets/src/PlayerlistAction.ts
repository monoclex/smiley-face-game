import Schema, { Type } from "computed-types";
import { PlayerlistActionKindSchema } from "@smiley-face-game/schemas/PlayerlistActionKind";

export const PLAYER_LIST_ACTION_ID = "PLAYER_LIST_ACTION";
export const PlayerlistActionSchema = Schema.merge(
  {
    packetId: PLAYER_LIST_ACTION_ID as typeof PLAYER_LIST_ACTION_ID,
  },
  PlayerlistActionKindSchema
);
export type PlayerlistActionPacket = Type<typeof PlayerlistActionSchema>;
export const validatePlayerlistAction = PlayerlistActionSchema.destruct();