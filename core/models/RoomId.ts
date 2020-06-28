import { Schema, string, Type } from "../../deps.ts";

export const RoomIdSchema = Schema(string);
export type RoomId = Type<typeof RoomIdSchema>;
export const validateRoomId = RoomIdSchema.destruct();
