import { number, Schema, Type } from "../../deps.ts";
import { RoomIdSchema } from './RoomId.ts';

export const GamePreviewSchema = Schema({
  id: RoomIdSchema,
  playerCount: number.gte(0).integer(),
});
export type GamePreview = Type<typeof GamePreviewSchema>;
export const validateGamePreview = GamePreviewSchema.destruct();
