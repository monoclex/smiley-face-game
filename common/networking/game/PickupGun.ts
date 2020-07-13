import Schema, { Type } from "computed-types";
import { PlayerPositionSchema } from "../../models/PlayerPosition";

export const PICKUP_GUN_ID = 'PICKUP_GUN';
export const PickupGunSchema = Schema({
  packetId: PICKUP_GUN_ID,
  position: PlayerPositionSchema,
});
export type PickupGunPacket = Type<typeof PickupGunSchema>;
export const validatePickupGun = PickupGunSchema.destruct();
