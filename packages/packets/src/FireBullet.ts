import Schema, { number, Type } from "computed-types";

export const FIRE_BULLET_ID = "FIRE_BULLET";
export const FireBulletSchema = Schema({
  packetId: FIRE_BULLET_ID as typeof FIRE_BULLET_ID,
  angle: number.lte(Math.PI).gte(-Math.PI),
});
export type FireBulletPacket = Type<typeof FireBulletSchema>;
export const validateFireBullet = FireBulletSchema.destruct();
