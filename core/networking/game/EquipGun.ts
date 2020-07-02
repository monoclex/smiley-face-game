import { boolean, Schema, Type } from "../../../deps.ts";

export const EQUIP_GUN_ID = 'EQUIP_GUN';
export const EquipGunSchema = Schema({
  packetId: EQUIP_GUN_ID,
  equipped: boolean,
});
export type EquipGunPacket = Type<typeof EquipGunSchema>;
export const validateEquipGun = EquipGunSchema.destruct();
