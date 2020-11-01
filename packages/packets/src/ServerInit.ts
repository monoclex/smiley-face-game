import Schema, { array, boolean, SchemaInput } from "computed-types";
import { BlockSchema } from "@smiley-face-game/schemas/Block";
import { PlayerPositionSchema } from "@smiley-face-game/schemas/PlayerPosition";
import { SizeSchema } from "@smiley-face-game/schemas/Size";
import { ServerSchema } from "./Server";
import { UsernameSchema } from "@smiley-face-game/schemas/Username";
import { WorldIdSchema } from "@smiley-face-game/schemas/WorldId";
import { PlayerRoleSchema } from "@smiley-face-game/schemas/PlayerRole";

export const SERVER_INIT_ID = "SERVER_INIT";
export const ServerInitSchema = Schema.merge(
  {
    packetId: SERVER_INIT_ID as typeof SERVER_INIT_ID,
    role: PlayerRoleSchema,
    worldId: WorldIdSchema,
    size: SizeSchema,
    spawnPosition: PlayerPositionSchema,
    blocks: array.of(array.of(array.of(BlockSchema))),
    username: UsernameSchema,
    isGuest: boolean,
  },
  ServerSchema
);
export type ServerInitPacket = SchemaInput<typeof ServerInitSchema>;
export const validateServerInit = ServerInitSchema.destruct();
