import { Schema, Type } from "../../../deps.ts";
import { ServerSchema } from './Server.ts';

export const SERVER_PICKUP_GUN_ID = 'SERVER_PICKUP_GUN';
export const ServerPickupGunSchema = Schema.merge({
  packetId: SERVER_PICKUP_GUN_ID,
}, ServerSchema);
export type ServerPickupGunPacket = Type<typeof ServerPickupGunSchema>;
export const validateServerPickupGun = ServerPickupGunSchema.destruct();
