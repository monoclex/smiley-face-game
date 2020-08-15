import Schema, { Type } from "computed-types";
import { ServerSchema } from './Server';

export const SERVER_PICKUP_GUN_ID = 'SERVER_PICKUP_GUN';
export const ServerPickupGunSchema = Schema.merge({
  packetId: SERVER_PICKUP_GUN_ID as typeof SERVER_PICKUP_GUN_ID,
}, ServerSchema);
export type ServerPickupGunPacket = Type<typeof ServerPickupGunSchema>;
export const validateServerPickupGun = ServerPickupGunSchema.destruct();
