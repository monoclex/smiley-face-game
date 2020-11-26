import Schema, { addParse, SchemaInput } from "./computed-types-wrapper";
import { zWorldId, zWorldName, zDynWidth, zDynHeight } from "./types";

export const zJoinRequest = addParse(
  Schema.either(
    {
      // "dynamic" worlds are ones that can be created *on demand*, without an account. They aren't saved.
      type: "dynamic" as const,
      name: zWorldName,
      width: zDynWidth,
      height: zDynHeight,
    },
    {
      type: "dynamic" as const,
      id: zWorldId,
    },
    {
      // "saved" worlds are ones that must be loaded from the database. They are owned by players.
      type: "saved" as const,
      id: zWorldId,
    }
  )
);
export type ZJoinRequest = SchemaInput<typeof zJoinRequest>;
