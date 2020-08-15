import Schema, { boolean, Type } from "computed-types";
import { ServerSchema } from './Server';

export const SERVER_EQUIP_GUN_ID = 'SERVER_EQUIP_GUN';
export const ServerEquipGunSchema = Schema.merge({
  packetId: SERVER_EQUIP_GUN_ID as typeof SERVER_EQUIP_GUN_ID,
  equipped: boolean,
}, ServerSchema);
export type ServerEquipGunPacket = Type<typeof ServerEquipGunSchema>;
export const validateServerEquipGun = ServerEquipGunSchema.destruct();
