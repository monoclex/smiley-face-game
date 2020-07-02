import { boolean, Schema, Type } from "../../../deps.ts";
import { ServerSchema } from './Server.ts';

export const SERVER_EQUIP_GUN_ID = 'SERVER_EQUIP_GUN';
export const ServerEquipGunSchema = Schema.merge({
  packetId: SERVER_EQUIP_GUN_ID,
  equipped: boolean,
}, ServerSchema);
export type ServerEquipGunPacket = Type<typeof ServerEquipGunSchema>;
export const validateServerEquipGun = ServerEquipGunSchema.destruct();
