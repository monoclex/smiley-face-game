import Schema, { number, Type } from "computed-types";
import { ServerSchema } from './Server';

export const SERVER_FIRE_BULLET_ID = 'SERVER_FIRE_BULLET';
export const ServerFireBulletSchema = Schema.merge({
  packetId: SERVER_FIRE_BULLET_ID,
  angle: number.lte(Math.PI).gte(-Math.PI),
}, ServerSchema);
export type ServerFireBulletPacket = Type<typeof ServerFireBulletSchema>;
export const validateServerFireBullet = ServerFireBulletSchema.destruct();
