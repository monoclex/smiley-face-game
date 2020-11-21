import type { ZPacketLookup } from "@smiley-face-game/api";
import RoomLogic from "../../worlds/logic/RoomLogic";
import Connection from "../../worlds/Connection";
import handleBlockLine from "./handlers/handleBlockLine";
import handleBlockSingle from "./handlers/handleBlockSingle";
import handleChat from "./handlers/handleChat";
import handleEquipGun from "./handlers/handleEquipGun";
import handleFireBullet from "./handlers/handleFireBullet";
import handleMovement from "./handlers/handleMovement";
import handlePickupGun from "./handlers/handlePickupGun";
import handlePlayerlistAction from "./handlers/handlePlayerlistAction";
import handleWorldAction from "./handlers/handleWorldAction";

type MaybeAsync<T> = T | Promise<T>;

const packetLookup: ZPacketLookup<[Connection, RoomLogic], MaybeAsync<void | boolean>> = {
  BLOCK_LINE: handleBlockLine,
  BLOCK_SINGLE: handleBlockSingle,
  EQUIP_GUN: handleEquipGun,
  FIRE_BULLET: handleFireBullet,
  MOVEMENT: handleMovement,
  PICKUP_GUN: handlePickupGun,
  CHAT: handleChat,
  PLAYER_LIST_ACTION: handlePlayerlistAction,
  WORLD_ACTION: handleWorldAction,
};

export default packetLookup;
