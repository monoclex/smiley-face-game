import Schema, { number, Type } from "computed-types";
import { RoomIdSchema } from "./RoomId";

export const GamePreviewSchema = Schema({
  id: RoomIdSchema,
  playerCount: number.gte(0).integer(),
});
export type WorldPreview = Type<typeof GamePreviewSchema>;
export const validateGamePreview = GamePreviewSchema.destruct();
