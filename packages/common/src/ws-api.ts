import * as z from "zod";
import { zWorldId, zWorldName, zDynWidth, zDynHeight } from "./misc-zs";

export const zJoinRequest = z.union([
  z.object({
    // "dynamic" worlds are ones that can be created *on demand*, without an account. They aren't saved.
    type: z.literal("dynamic"),
    name: zWorldName,
    width: zDynWidth,
    height: zDynHeight,
  }),
  z.object({
    type: z.literal("dynamic"),
    id: zWorldId,
  }),
  z.object({
    // "saved" worlds are ones that must be loaded from the database. They are owned by players.
    type: z.literal("saved"),
    id: zWorldId
  }),
]);
