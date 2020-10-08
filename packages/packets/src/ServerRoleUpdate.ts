import Schema, { Type } from "computed-types";
import { ServerSchema } from "./Server";
import { PlayerRoleSchema } from "@smiley-face-game/schemas/PlayerRole";

export const SERVER_ROLE_UPDATE_ID = "SERVER_ROLE_UPDATE";
export const ServerRoleUpdateSchema = Schema.merge(
  {
    packetId: SERVER_ROLE_UPDATE_ID as typeof SERVER_ROLE_UPDATE_ID,
    newRole: PlayerRoleSchema,
  },
  ServerSchema
);
export type ServerRoleUpdatePacket = Type<typeof ServerRoleUpdateSchema>;
export const validateServerRoleUpdate = ServerRoleUpdateSchema.destruct();
