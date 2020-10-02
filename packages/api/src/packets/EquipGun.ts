import Schema, { boolean, Type } from "computed-types";

export const EQUIP_GUN_ID = "EQUIP_GUN";
export const EquipGunSchema = Schema({
  packetId: EQUIP_GUN_ID as typeof EQUIP_GUN_ID,
  equipped: boolean,
});
export type EquipGunPacket = Type<typeof EquipGunSchema>;
export const validateEquipGun = EquipGunSchema.destruct();
