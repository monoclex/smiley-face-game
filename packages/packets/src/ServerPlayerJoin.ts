import { PlayerRoleSchema } from "@smiley-face-game/schemas/PlayerRole";
import Schema, { boolean, Type } from "computed-types";
import { PlayerPositionSchema } from "@smiley-face-game/schemas/PlayerPosition";
import { UsernameSchema } from "@smiley-face-game/schemas/Username";
import { ServerSchema } from "./Server";

export const SERVER_PLAYER_JOIN_ID = "SERVER_PLAYER_JOIN";
export const ServerPlayerJoinSchema = Schema.merge(
  {
    packetId: SERVER_PLAYER_JOIN_ID as typeof SERVER_PLAYER_JOIN_ID,
    username: UsernameSchema,
    role: PlayerRoleSchema,
    isGuest: boolean,
    joinLocation: PlayerPositionSchema,
    hasGun: boolean,
    gunEquipped: boolean,
  },
  ServerSchema
);
export type ServerPlayerJoinPacket = Type<typeof ServerPlayerJoinSchema>;
export const validateServerPlayerJoin = ServerPlayerJoinSchema.destruct();
