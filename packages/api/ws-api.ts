import Schema, { addParse, SchemaInput } from "./computed-types-wrapper";
import { zWorldId, zWorldName, zDynWidth, zDynHeight } from "./types";

export const zJoinRequest = addParse(
  Schema.either(
    {
      // create a dynamic room
      type: "create" as const,
      name: zWorldName,
      width: zDynWidth,
      height: zDynHeight,
    },
    {
      // join a saved/dynamic room
      type: "join" as const,
      id: zWorldId,
    }
  )
);
export type ZJoinRequest = SchemaInput<typeof zJoinRequest>;
