import type { ZPacketLookup } from "@smiley-face-game/api";
import type Connection from "./Connection";
import type Server from "./Server";
import handleBlockLine from "./handlers/handleBlockLine";
import handleBlockSingle from "./handlers/handleBlockSingle";
import handleChat from "./handlers/handleChat";
import handleEquipGun from "./handlers/handleEquipGun";
import handleFireBullet from "./handlers/handleFireBullet";
import handleMovement from "./handlers/handleMovement";
import handlePickupGun from "./handlers/handlePickupGun";
import handlePlayerlistAction from "./handlers/handlePlayerlistAction";
import handleWorldAction from "./handlers/handleWorldAction";
import handleKeyTouch from "./handlers/handleKeyTouch";
import handleToggleGod from "./handlers/handleToggleGod";
import handleTeleportPlayer from "./handlers/handleTeleportPlayer";

type MaybeAsync<T> = T | Promise<T>;

const packetLookup: ZPacketLookup<[Connection, Server], MaybeAsync<void | boolean>> = {
  BLOCK_LINE: handleBlockLine,
  BLOCK_SINGLE: handleBlockSingle,
  EQUIP_GUN: handleEquipGun,
  FIRE_BULLET: handleFireBullet,
  MOVEMENT: handleMovement,
  PICKUP_GUN: handlePickupGun,
  CHAT: handleChat,
  PLAYER_LIST_ACTION: handlePlayerlistAction,
  WORLD_ACTION: handleWorldAction,
  KEY_TOUCH: handleKeyTouch,
  TOGGLE_GOD: handleToggleGod,
  TELEPORT_PLAYER: handleTeleportPlayer,
};

export default packetLookup;
