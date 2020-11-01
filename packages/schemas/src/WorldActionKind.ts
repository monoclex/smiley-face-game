import Schema, { Type } from "computed-types";
import { WorldBlocksSchema } from "@smiley-face-game/schemas/WorldBlocks";

export const WorldActionKindSchema = Schema.either(
  {
    action: "save" as const,
  },
  {
    action: "load" as const,
    // TODO: enforce that the **server** will send this, and that the client **wont**.
    // for now, saying that this is optional and calling it a day is me being lazy
    blocks: WorldBlocksSchema.optional(),
  }
);
export type WorldActionKind = Type<typeof WorldActionKindSchema>;
export const validateWorldActionKind = WorldActionKindSchema.destruct();
