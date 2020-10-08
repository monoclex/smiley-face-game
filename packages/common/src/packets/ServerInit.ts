import Schema, { array, Type, boolean } from "computed-types";
import { BlockSchema, Block } from "../schemas/Block";
import { PlayerPositionSchema } from "../schemas/PlayerPosition";
import { SizeSchema } from "../schemas/Size";
import { ServerSchema } from "./Server";
import { UsernameSchema } from "../schemas/Username";
import { WorldIdSchema } from "@smiley-face-game/common/schemas/WorldId";
import { PlayerRoleSchema } from "../schemas/PlayerRole";

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
export type ServerInitPacket = Omit<Type<typeof ServerInitSchema>, "blocks"> & { blocks: Block[][][] };
export const validateServerInit = ServerInitSchema.destruct();
